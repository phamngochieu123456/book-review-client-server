// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  Divider,
  Chip,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StarIcon from '@mui/icons-material/Star';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import { bookApi } from '../api/bookApi';
import BookCard from '../components/book/BookCard';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch books data
  useEffect(() => {
    const fetchBooksData = async () => {
      setLoading(true);
      try {
        // Fetch recent books
        const recentBooksResponse = await bookApi.getAllBooks(
          0, 
          4, 
          'createdAt', 
          'desc'
        );
        setRecentBooks(recentBooksResponse.content || []);
        
        // Fetch top rated books
        const topRatedBooksResponse = await bookApi.getAllBooks(
          0, 
          4, 
          'averageRating', 
          'desc'
        );
        setTopRatedBooks(topRatedBooksResponse.content || []);
        
        // For featured books, we could have a specific API endpoint
        // For now, just use the first 3 books from the recent ones
        setFeaturedBooks(recentBooksResponse.content?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching books for homepage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooksData();
  }, []);
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      // Navigate to books page with search term
      window.location.href = `/books?searchTerm=${encodeURIComponent(searchTerm)}`;
    }
  };
  
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: { xs: 6, md: 12 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
              >
                Discover Your Next Favorite Book
              </Typography>
              <Typography variant="h6" paragraph sx={{ mb: 3, opacity: 0.9 }}>
                Read reviews, discover new books, and share your thoughts with our community of book lovers.
              </Typography>
              
              {/* Search Form */}
              <Paper
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  borderRadius: 10,
                  mb: 3,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search for books, authors, or genres..."
                  variant="standard"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ml: 1, flex: 1 }}
                />
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton type="submit" color="primary" sx={{ p: '10px' }}>
                  <ArrowForwardIcon />
                </IconButton>
              </Paper>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/books"
                  sx={{ borderRadius: 10, px: 3 }}
                >
                  Browse Books
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ borderRadius: 10, px: 3, borderColor: 'white' }}
                >
                  Join Now
                </Button>
              </Box>
            </Grid>
            
            {!isMobile && (
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    position: 'relative',
                    height: 400,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {/* Book stack illustration */}
                  {[1, 2, 3].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'absolute',
                        width: 180,
                        height: 280,
                        top: 60 + (index * 20),
                        left: 60 + (index * 20),
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2,
                        boxShadow: 6,
                        transform: `rotate(${5 - (index * 5)}deg)`,
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: `rotate(${5 - (index * 5)}deg) translateY(-10px)`,
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {loading ? (
                        <Skeleton variant="rectangular" width="100%" height="100%" />
                      ) : (
                        featuredBooks[index - 1]?.coverImageUrl ? (
                          <img
                            src={featuredBooks[index - 1].coverImageUrl}
                            alt={featuredBooks[index - 1].title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                        ) : (
                          <AutoStoriesIcon 
                            sx={{ 
                              fontSize: 80, 
                              color: theme.palette.primary.main,
                              opacity: 0.7
                            }} 
                          />
                        )
                      )}
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Recent Books Section */}
        <Box sx={{ mb: 8 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FeaturedPlayListIcon 
                sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} 
              />
              <Typography variant="h4" component="h2" fontWeight="bold">
                Recent Additions
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/books?sortBy=createdAt&sortDir=desc"
              endIcon={<ArrowForwardIcon />}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(4)).map((_, index) => (
                  <Grid item key={index} xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <Skeleton variant="rectangular" height={320} />
                      <CardContent>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : recentBooks.map((book) => (
                  <Grid item key={book.id} xs={12} sm={6} md={3}>
                    <BookCard book={book} />
                  </Grid>
                ))}
          </Grid>
        </Box>
        
        {/* Top Rated Books Section */}
        <Box sx={{ mb: 8 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon 
                sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} 
              />
              <Typography variant="h4" component="h2" fontWeight="bold">
                Top Rated Books
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/books?sortBy=averageRating&sortDir=desc"
              endIcon={<ArrowForwardIcon />}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(4)).map((_, index) => (
                  <Grid item key={index} xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%' }}>
                      <Skeleton variant="rectangular" height={320} />
                      <CardContent>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : topRatedBooks.map((book) => (
                  <Grid item key={book.id} xs={12} sm={6} md={3}>
                    <BookCard book={book} />
                  </Grid>
                ))}
          </Grid>
        </Box>
        
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Why Join Our Community?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: '50%',
                    p: 2,
                    mb: 2,
                  }}
                >
                  <AutoStoriesIcon fontSize="large" />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Discover New Books
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Find your next favorite read from our extensive collection of books across all genres.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: '50%',
                    p: 2,
                    mb: 2,
                  }}
                >
                  <StarIcon fontSize="large" />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Share Your Thoughts
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Rate and review books, helping others discover great reads while building your literary profile.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: '50%',
                    p: 2,
                    mb: 2,
                  }}
                >
                  <FeaturedPlayListIcon fontSize="large" />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Track Your Reading
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Keep a record of books you've read, want to read, and are currently reading with personalized lists.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 3,
            borderRadius: 4,
            bgcolor: theme.palette.primary.light,
            color: 'white',
          }}
        >
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
            Ready to Start Your Reading Journey?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            Join our community of book lovers today and start discovering, reviewing, and discussing books!
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ borderRadius: 10, px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Sign Up Now
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
