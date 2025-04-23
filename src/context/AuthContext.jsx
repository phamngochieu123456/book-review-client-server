import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import {jwtDecode} from 'jwt-decode';

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in from access token
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (authService.isAuthenticated()) {
          const accessToken = authService.getAccessToken();
          
          // Decode token to get user information
          const decodedToken = jwtDecode(accessToken);
          
          // Extract user information from token
          const userData = {
            id: decodedToken.user_id,
            username: decodedToken.sub,
            roles: decodedToken.roles || [],
            permissions: decodedToken.permissions || []
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.roles.includes('ADMIN'));
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        // Clear invalid token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expiresAt');
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login function - initiates OAuth2 flow
  const login = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.initiateLogin();
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Handle OAuth callback - using useCallback to avoid recreating this function on each render
  const handleOAuthCallback = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    
    try {
      const tokens = await authService.handleLoginCallback(code);
      
      // Decode token to get user information
      const decodedToken = jwtDecode(tokens.access_token);
      
      // Extract user information from token
      const userData = {
        id: decodedToken.user_id,
        username: decodedToken.sub,
        roles: decodedToken.roles || [],
        permissions: decodedToken.permissions || []
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.roles.includes('ADMIN'));
      setLoading(false);
      return true;
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('Authentication failed. Please try again.');
      setLoading(false);
      return false;
    }
  }, []); // No dependencies because it doesn't depend on any state or props

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(
        userData.username,
        userData.email,
        userData.password,
        userData.passwordConfirmation
      );
      setLoading(false);
      return { success: true, message: 'Registration successful! Please log in.' };
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.error || 'Registration failed. Please try again.');
      setLoading(false);
      return { success: false, message: err.error || 'Registration failed.' };
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    handleOAuthCallback,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
