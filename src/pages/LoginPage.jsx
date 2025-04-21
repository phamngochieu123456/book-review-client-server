import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Link as MuiLink,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginPage = () => {
  const { isAuthenticated, login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page they were trying to access or to home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle login button click
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // This will redirect the user to the Auth Server login page
      await login();
    } catch (err) {
      console.error("Error initiating login:", err);
      setIsLoggingIn(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                color: 'white',
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Typography component="h1" variant="h5" fontWeight="bold">
              Sign In
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {location.state?.message && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {location.state.message}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleLogin}
            disabled={isLoggingIn || loading}
            sx={{ py: 1.5, mt: 2 }}
          >
            {(isLoggingIn || loading) ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Signing in...
              </>
            ) : 'Sign in with BookReads'}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/register" fontWeight="medium">
                Sign Up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            For demo purposes, use:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin: admin@example.com / admin123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User: user1@example.com / user123
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
