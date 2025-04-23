import axios from 'axios';

const AUTH_URL = 'http://localhost:8081'; // Auth Server URL
const AUTH_API_URL = 'http://localhost:8081/api'; // Auth Server API
const OAUTH_URL = 'http://localhost:8081/oauth2'; // OAuth2 endpoints 

// Client credentials
const CLIENT_ID = 'client_admin';
const CLIENT_SECRET = 'admin';

// Save tokens to localStorage
const setTokens = (tokens) => {
  localStorage.setItem('accessToken', tokens.access_token);
  localStorage.setItem('refreshToken', tokens.refresh_token);
  
  // Save expiration time
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
  
  return new Date().getTime() > parseInt(expiresAt);
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
  // Encode client_id:client_secret in Base64 format
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  return `Basic ${credentials}`;
};

// Initiate OAuth2 login process with PKCE
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

// Add clear error handling to avoid repeating errors
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
      // Use Basic Authentication instead of sending client_id in body
      const response = await axios.post(`${OAUTH_URL}/token`, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': createBasicAuthHeader()
        }
      });
      
      // Save tokens
      setTokens(response.data);
      
      // Remove code verifier as it's no longer needed
      localStorage.removeItem('codeVerifier');
      
      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error);
      
      // Add specific error handling
      if (error.response) {
        // If server returns an error
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        // Remove code verifier to prevent error repetition
        localStorage.removeItem('codeVerifier');
        
        throw {
          status: statusCode,
          error: errorData.error || 'Token exchange failed',
          error_description: errorData.error_description || 'An error occurred during token exchange'
        };
      } else if (error.request) {
        // If request was sent but no response received
        localStorage.removeItem('codeVerifier');
        throw { error: 'No response from server' };
      } else {
        // Request configuration error
        localStorage.removeItem('codeVerifier');
        throw { error: error.message || 'Error setting up request' };
      }
    }
  } catch (error) {
    // Ensure code verifier is removed in all error cases
    localStorage.removeItem('codeVerifier');

    if (retries > 0 && error.status === 500) {
      // Retry only for server errors, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000));
      return handleLoginCallback(code, retries - 1);
    }
    throw error;
    
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const tokenData = new URLSearchParams();
    tokenData.append('grant_type', 'refresh_token');
    tokenData.append('refresh_token', refreshToken);
    
    const response = await axios.post(`${OAUTH_URL}/token`, tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': createBasicAuthHeader()
      }
    });
    
    setTokens(response.data);
    return response.data.access_token;
  } catch (error) {
    // If refresh token is invalid, log out the user
    logout();
    throw new Error('Session expired. Please login again.');
  }
};

// Logout
const logout = () => {
  // Always remove tokens from localStorage first
  removeTokens();
  
  // Create logout URL with redirect_uri back to home page
  const homeUrl = 'http://localhost:3000/';
  const logoutUrl = `${AUTH_URL}/logout`;
  
  // Redirect to auth server logout page
  window.location.href = logoutUrl;
};

// Create axios instance with interceptor for token handling
const createAuthenticatedAxios = () => {
  const instance = axios.create();
  
  instance.interceptors.request.use(async (config) => {
    let token = getAccessToken();
    
    // If token is expired, refresh it
    if (token && isTokenExpired()) {
      try {
        token = await refreshAccessToken();
      } catch (error) {
        // If refresh fails, throw error to be handled outside
        throw error;
      }
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
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
  return !!token && !isTokenExpired();
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
  refreshAccessToken
};

export default authService;
