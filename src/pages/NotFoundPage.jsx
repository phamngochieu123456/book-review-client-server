// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  useTheme
} from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';

const NotFoundPage = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)', // Adjust based on navbar/footer height
          textAlign: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            width: '100%',
            maxWidth: 600,
          }}
        >
          <SentimentDissatisfiedIcon
            sx={{
              fontSize: 100,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />
          
          <Typography
            variant="h1"
            component="h1"
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '5rem', md: '7rem' },
              color: theme.palette.primary.main,
              lineHeight: 1.1
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            component="h2"
            fontWeight="medium"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Page Not Found
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ mb: 4, maxWidth: 450, mx: 'auto' }}
          >
            The page you're looking for doesn't exist or has been moved.
            Please check the URL or navigate back to explore our books.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
              fullWidth={false}
              sx={{ minWidth: 150 }}
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/books"
              startIcon={<SearchIcon />}
              fullWidth={false}
              sx={{ minWidth: 150 }}
            >
              Browse Books
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
