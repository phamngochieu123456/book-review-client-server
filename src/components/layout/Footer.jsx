// src/components/layout/Footer.jsx
import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 4, 
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand column */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2 
              }}
            >
              <AutoStoriesIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography 
                variant="h6" 
                component={RouterLink} 
                to="/"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'text.primary',
                  textDecoration: 'none'
                }}
              >
                BOOKREADS
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Discover your next favorite book with our comprehensive book review platform.
              Connect with fellow readers and explore new worlds through literature.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
              <Link href="#" color="inherit">
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit">
                <TwitterIcon />
              </Link>
              <Link href="#" color="inherit">
                <InstagramIcon />
              </Link>
            </Box>
          </Grid>
          
          {/* Quick links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Explore
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/" color="inherit" underline="hover">
                  Home
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/books" color="inherit" underline="hover">
                  Books
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/authors" color="inherit" underline="hover">
                  Authors
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/categories" color="inherit" underline="hover">
                  Categories
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Account links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Account
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/login" color="inherit" underline="hover">
                  Sign In
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/register" color="inherit" underline="hover">
                  Register
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/profile" color="inherit" underline="hover">
                  My Profile
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/my-reviews" color="inherit" underline="hover">
                  My Reviews
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Support links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/help" color="inherit" underline="hover">
                  Help Center
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/faq" color="inherit" underline="hover">
                  FAQ
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/contact" color="inherit" underline="hover">
                  Contact Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
                  Terms of Service
                </Link>
              </Box>
            </Box>
          </Grid>
          
          {/* Admin links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Admin
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/admin" color="inherit" underline="hover">
                  Dashboard
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/admin/books" color="inherit" underline="hover">
                  Manage Books
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/admin/authors" color="inherit" underline="hover">
                  Manage Authors
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/admin/categories" color="inherit" underline="hover">
                  Manage Categories
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} BookReads. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
