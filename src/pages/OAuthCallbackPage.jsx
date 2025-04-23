import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';

const OAuthCallbackPage = () => {
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const processedRef = useRef(false);

  useEffect(() => {
    // Use ref to ensure callback is processed only once
    if (processedRef.current) return;
    
    const processCallback = async () => {
      try {
        // Mark as processed to prevent multiple processing
        processedRef.current = true;
        
        // Extract authorization code from URL search params
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        
        if (!code) {
          setError('Authorization code not found');
          return;
        }

        // Process the authorization code
        const success = await handleOAuthCallback(code);
        
        if (success) {
          // Redirect to home page or intended destination
          const destination = sessionStorage.getItem('redirectAfterLogin') || '/';
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(destination, { replace: true });
        } else {
          setError('Failed to authenticate. Please try again.');
        }
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    processCallback();
    
    // Callback shouldn't depend on location since location doesn't change after mounting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOAuthCallback, navigate]);

  // Redirect to login page after displaying error
  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Add timeout to prevent page hanging for too long
  useEffect(() => {
    // Add timeout to avoid page hanging for too long
    const timeoutId = setTimeout(() => {
      if (!processedRef.current) {
        setError('Authentication request timed out. Please try again.');
      }
    }, 30000); // 30 seconds

    // Cleanup timeout
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {error ? (
          <>
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBackToLogin}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </>
        ) : (
          <>
            <CircularProgress size={50} sx={{ mb: 4 }} />
            <Typography variant="h6">
              Completing authentication, please wait...
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default OAuthCallbackPage;
