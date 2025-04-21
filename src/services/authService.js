import axios from 'axios';

const AUTH_URL = 'http://localhost:8081'; // Auth Server URL
const AUTH_API_URL = 'http://localhost:8081/api'; // Auth Server API
const OAUTH_URL = 'http://localhost:8081/oauth2'; // OAuth2 endpoints 

// Client credentials
const CLIENT_ID = 'client_admin';
const CLIENT_SECRET = 'admin';

// Lưu token vào localStorage
const setTokens = (tokens) => {
  localStorage.setItem('accessToken', tokens.access_token);
  localStorage.setItem('refreshToken', tokens.refresh_token);
  
  // Lưu thời gian hết hạn 
  const expiresIn = tokens.expires_in || 3600; // Mặc định 1 giờ
  const expiresAt = new Date().getTime() + expiresIn * 1000;
  localStorage.setItem('expiresAt', expiresAt.toString());
};

// Lấy access token từ localStorage
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Kiểm tra token đã hết hạn chưa
export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('expiresAt');
  if (!expiresAt) return true;
  
  return new Date().getTime() > parseInt(expiresAt);
};

// Lấy refresh token từ localStorage
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Xóa tokens khỏi localStorage khi đăng xuất
const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('codeVerifier');
};

// Đăng ký người dùng mới
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

// Tạo code verifier cho PKCE
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
};

// Tạo code challenge từ code verifier
const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Tạo Basic Authentication header
const createBasicAuthHeader = () => {
  // Encode client_id:client_secret theo chuẩn Base64
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  return `Basic ${credentials}`;
};

// Bắt đầu quá trình đăng nhập OAuth2 với PKCE
const initiateLogin = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Lưu code verifier để sử dụng sau
  localStorage.setItem('codeVerifier', codeVerifier);
  
  // Cấu hình OAuth2 
  const redirectUri = 'http://localhost:3000/oauth/callback';
  const scope = 'openid'; 
  
  // Chuyển hướng đến trang đăng nhập của Auth Server
  window.location.href = `${OAUTH_URL}/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
};

// Cần thêm xử lý lỗi rõ ràng để tránh lỗi lặp lại
const handleLoginCallback = async (code, retries = 1) => {
  try {
    // Lấy code verifier đã lưu trước đó
    const codeVerifier = localStorage.getItem('codeVerifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }
    
    // Trao đổi authorization code lấy tokens
    const tokenData = new URLSearchParams();
    tokenData.append('redirect_uri', 'http://localhost:3000/oauth/callback');
    tokenData.append('grant_type', 'authorization_code');
    tokenData.append('code', code);
    tokenData.append('code_verifier', codeVerifier);
    
    try {
      // Sử dụng Basic Authentication thay vì gửi client_id trong body
      const response = await axios.post(`${OAUTH_URL}/token`, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': createBasicAuthHeader()
        }
      });
      
      // Lưu tokens
      setTokens(response.data);
      
      // Xóa code verifier không cần thiết nữa
      localStorage.removeItem('codeVerifier');
      
      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error);
      
      // Thêm xử lý lỗi cụ thể
      if (error.response) {
        // Nếu server trả về lỗi
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        // Xóa code verifier để tránh lặp lại lỗi
        localStorage.removeItem('codeVerifier');
        
        throw {
          status: statusCode,
          error: errorData.error || 'Token exchange failed',
          error_description: errorData.error_description || 'An error occurred during token exchange'
        };
      } else if (error.request) {
        // Nếu yêu cầu được gửi nhưng không nhận được phản hồi
        localStorage.removeItem('codeVerifier');
        throw { error: 'No response from server' };
      } else {
        // Lỗi cấu hình request
        localStorage.removeItem('codeVerifier');
        throw { error: error.message || 'Error setting up request' };
      }
    }
  } catch (error) {
    // Đảm bảo xóa code verifier trong mọi trường hợp lỗi
    localStorage.removeItem('codeVerifier');

    if (retries > 0 && error.status === 500) {
      // Retry only for server errors, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000));
      return handleLoginCallback(code, retries - 1);
    }
    throw error;
    
  }
};

// Làm mới access token bằng refresh token
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
    // Nếu refresh token không hợp lệ, đăng xuất người dùng
    logout();
    throw new Error('Session expired. Please login again.');
  }
};

// Đăng xuất
const logout = () => {
  // Luôn xóa token khỏi localStorage trước
  removeTokens();
  
  // Tạo URL logout với redirect_uri quay về trang chủ
  const homeUrl = 'http://localhost:3000/';
  const logoutUrl = `${AUTH_URL}/logout`;
  
  // Chuyển hướng đến trang logout của auth server
  window.location.href = logoutUrl;
};

// Tạo axios instance với interceptor xử lý token
const createAuthenticatedAxios = () => {
  const instance = axios.create();
  
  instance.interceptors.request.use(async (config) => {
    let token = getAccessToken();
    
    // Nếu token hết hạn, làm mới nó
    if (token && isTokenExpired()) {
      try {
        token = await refreshAccessToken();
      } catch (error) {
        // Nếu không thể làm mới, ném lỗi để xử lý bên ngoài
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

// API instance đã được xác thực
const authAxios = createAuthenticatedAxios();

// Lấy thông tin hồ sơ người dùng
const getUserProfile = async () => {
  try {
    const response = await authAxios.get(`${AUTH_API_URL}/users/me`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get user profile' };
  }
};

// Cập nhật thông tin hồ sơ người dùng
const updateUserProfile = async (profileData) => {
  try {
    const response = await authAxios.put(`${AUTH_API_URL}/users/me`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update user profile' };
  }
};

// Đổi mật khẩu
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

// Kiểm tra người dùng đã đăng nhập chưa
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
