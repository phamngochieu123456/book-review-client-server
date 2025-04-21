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
    // Sử dụng ref để đảm bảo callback chỉ được xử lý một lần
    if (processedRef.current) return;
    
    const processCallback = async () => {
      try {
        // Đánh dấu đã xử lý để ngăn chặn xử lý nhiều lần
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
    
    // Callback không nên phụ thuộc vào location vì location không thay đổi sau khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOAuthCallback, navigate]);

  // Chuyển hướng về trang login sau khi hiển thị lỗi
  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Trong OAuthCallbackPage.jsx
  useEffect(() => {
    // Thêm timeout để tránh treo trang quá lâu
    const timeoutId = setTimeout(() => {
      if (!processedRef.current) {
        setError('Authentication request timed out. Please try again.');
      }
    }, 30000); // 30 giây

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
