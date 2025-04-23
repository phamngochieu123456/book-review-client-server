import axios from 'axios';

const AUTH_URL = 'http://localhost:8081'; // Auth Server URL
const AUTH_API_URL = 'http://localhost:8081/api'; // Auth Server API
const OAUTH_URL = 'http://localhost:8081/oauth2'; // OAuth2 endpoints 

// Client credentials
const CLIENT_ID = 'client_admin';
const CLIENT_SECRET = 'admin';

// Flag to track if a token refresh is in progress
let isRefreshingToken = false;
// Array to store pending requests that are waiting for token refresh
let pendingRequests = [];

// Store tokens in localStorage
const setTokens = (tokens) => {
  localStorage.setItem('accessToken', tokens.access_token);
  localStorage.setItem('refreshToken', tokens.refresh_token);
  
  // Calculate and save expiration time
  const expiresIn = tokens.expires_in || 3600; // Default 1 hour
  const expiresAt = new Date().getTime() + expiresIn * 1000;
  localStorage.setItem('expiresAt', expiresAt.toString());
};

// Get access token from localStorage
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Check if token is expired
export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('expiresAt');
  if (!expiresAt) return true;
  
  // Add a buffer of 30 seconds to ensure we refresh slightly before actual expiration
  const bufferTime = 30 * 1000; // 30 seconds in milliseconds
  return new Date().getTime() > (parseInt(expiresAt) - bufferTime);
};

// Get refresh token from localStorage
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Remove tokens from localStorage on logout
const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('codeVerifier');
};

// Register new user
const register = async (username, email, password, passwordConfirmation) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/register`, {
      username,
      email,
      password,
      passwordConfirmation
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

// Create code verifier for PKCE
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
};

// Create code challenge from code verifier
const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Create Basic Authentication header
const createBasicAuthHeader = () => {
  // Encode client_id:client_secret using Base64
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  return `Basic ${credentials}`;
};

// Initiate OAuth2 login with PKCE
const initiateLogin = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Save code verifier for later use
  localStorage.setItem('codeVerifier', codeVerifier);
  
  // OAuth2 configuration
  const redirectUri = 'http://localhost:3000/oauth/callback';
  const scope = 'openid'; 
  
  // Redirect to Auth Server login page
  window.location.href = `${OAUTH_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
};

// Handle OAuth callback with error handling and retries
const handleLoginCallback = async (code, retries = 1) => {
  try {
    // Get previously saved code verifier
    const codeVerifier = localStorage.getItem('codeVerifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }
    
    // Exchange authorization code for tokens
    const tokenData = new URLSearchParams();
    tokenData.append('redirect_uri', 'http://localhost:3000/oauth/callback');
    tokenData.append('grant_type', 'authorization_code');
    tokenData.append('code', code);
    tokenData.append('code_verifier', codeVerifier);
    
    try {
      // Use Basic Authentication
      const response = await axios.post(`${OAUTH_URL}/token`, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': createBasicAuthHeader()
        }
      });
      
      // Save tokens
      setTokens(response.data);
      
      // Clear code verifier
      localStorage.removeItem('codeVerifier');
      
      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error);
      
      // Handle specific errors
      if (error.response) {
        // Server returned an error
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        // Clean up code verifier to avoid repeating the error
        localStorage.removeItem('codeVerifier');
        
        throw {
          status: statusCode,
          error: errorData.error || 'Token exchange failed',
          error_description: errorData.error_description || 'An error occurred during token exchange'
        };
      } else if (error.request) {
        // No response received
        localStorage.removeItem('codeVerifier');
        throw { error: 'No response from server' };
      } else {
        // Request setup error
        localStorage.removeItem('codeVerifier');
        throw { error: error.message || 'Error setting up request' };
      }
    }
  } catch (error) {
    // Ensure code verifier is cleaned up in all error cases
    localStorage.removeItem('codeVerifier');

    if (retries > 0 && error.status === 500) {
      // Retry for server errors with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000));
      return handleLoginCallback(code, retries - 1);
    }
    throw error;
  }
};

/**
 * Refresh access token using refresh token.
 * This function includes proper error handling for invalid refresh tokens
 * and will only make one refresh attempt at a time.
 * 
 * @returns {Promise<string>} New access token
 * @throws {Error} If refresh fails
 */
const refreshAccessToken = async () => {
  // If refresh is already in progress, wait for it to complete
  if (isRefreshingToken) {
    return new Promise((resolve, reject) => {
      // Add this request to the pending queue
      pendingRequests.push({ resolve, reject });
    });
  }
  
  try {
    isRefreshingToken = true;
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const tokenData = new URLSearchParams();
    tokenData.append('grant_type', 'refresh_token');
    tokenData.append('refresh_token', refreshToken);
    
    const response = await axios.post(`${OAUTH_URL}/token`, tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': createBasicAuthHeader()
      }
    });
    
    // Save new tokens
    setTokens(response.data);
    
    // Resolve all pending requests
    pendingRequests.forEach(request => request.resolve(response.data.access_token));
    pendingRequests = [];
    
    return response.data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Reject all pending requests
    pendingRequests.forEach(request => request.reject(error));
    pendingRequests = [];
    
    // If refresh token is invalid, log out user
    logout();
    
    throw new Error('Session expired. Please login again.');
  } finally {
    isRefreshingToken = false;
  }
};

/**
 * Checks if the access token is expired and refreshes it if needed.
 * Only attempts to refresh once.
 * 
 * @returns {Promise<string>} Valid access token
 * @throws {Error} If unable to get a valid token
 */
const getValidAccessToken = async () => {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('No access token available');
  }
  
  if (isTokenExpired()) {
    try {
      token = await refreshAccessToken();
    } catch (error) {
      // If refresh fails, throw error to trigger login
      throw error;
    }
  }
  
  return token;
};

// Logout user
const logout = () => {
  // Clear tokens before redirecting
  removeTokens();
  
  // Redirect to auth server logout
  const homeUrl = 'http://localhost:3000/';
  const logoutUrl = `${AUTH_URL}/logout`;
  
  window.location.href = logoutUrl;
};

// Create authenticated axios instance with token refresh
const createAuthenticatedAxios = () => {
  const instance = axios.create();
  
  instance.interceptors.request.use(async (config) => {
    try {
      // Get valid token (refreshes if needed)
      if (isAuthenticated()) {
        const token = await getValidAccessToken();
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      // Redirect to login if token refresh fails
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }, (error) => Promise.reject(error));
  
  return instance;
};

// Authenticated API instance
const authAxios = createAuthenticatedAxios();

// Get user profile
const getUserProfile = async () => {
  try {
    const response = await authAxios.get(`${AUTH_API_URL}/users/me`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get user profile' };
  }
};

// Update user profile
const updateUserProfile = async (profileData) => {
  try {
    const response = await authAxios.put(`${AUTH_API_URL}/users/me`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update user profile' };
  }
};

// Change password
const changePassword = async (currentPassword, newPassword, passwordConfirmation) => {
  try {
    const response = await authAxios.post(`${AUTH_API_URL}/users/me/change-password`, {
      currentPassword,
      newPassword,
      passwordConfirmation
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to change password' };
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

export const authService = {
  register,
  initiateLogin,
  handleLoginCallback,
  logout,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAccessToken,
  isAuthenticated,
  refreshAccessToken,
  getValidAccessToken
};

export default authService;
