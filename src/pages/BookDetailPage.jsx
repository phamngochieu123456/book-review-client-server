// src/pages/BookDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Button, 
  Divider, 
  Chip, 
  Rating, 
  Paper, 
  Breadcrumbs,
  Skeleton,
  Link,
  Avatar,
  Stack,
  useTheme,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { bookApi } from '../api/bookApi';
import { useAuth } from '../context/AuthContext';
import ReviewList from '../components/review/ReviewList';
import CommentList from '../components/comment/CommentList';

const BookDetailPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Admin status - in a real app, would come from auth context
  const isAdmin = user && user.roles?.includes('ADMIN');

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        const data = await bookApi.getBookById(id);
        setBook(data);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Placeholder image if no cover is available
  const coverImage = book?.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover+Available';

  // Skeleton loaders while content is loading
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} /> {/* Breadcrumbs */}
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={500} /> {/* Book cover */}
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} /> {/* Title */}
            <Skeleton variant="text" width="60%" /> {/* Author */}
            <Box sx={{ display: 'flex', my: 2 }}>
              <Skeleton variant="rectangular" width={120} height={24} sx={{ mr: 1 }} /> {/* Chip 1 */}
              <Skeleton variant="rectangular" width={120} height={24} /> {/* Chip 2 */}
            </Box>
            <Skeleton variant="text" width="40%" /> {/* Rating */}
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} /> {/* Description */}
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/books" 
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Back to Books
        </Button>
      </Container>
    );
  }

  // If book not found
  if (!book) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Book not found or has been removed.
        </Alert>
        <Button 
          component={RouterLink} 
          to="/books" 
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Back to Books
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/books" color="inherit">
          Books
        </Link>
        <Typography color="text.primary">{book.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Book Cover */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              maxWidth: 350,
              mx: 'auto'
            }}
          >
            <Box
              component="img"
              src={coverImage}
              alt={book.title}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Paper>

          {/* Admin actions */}
          {isAdmin && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                component={RouterLink} 
                to={`/admin/books/edit/${book.id}`}
              >
                Edit Book
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                component={RouterLink} 
                to={`/admin/books/delete/${book.id}`}
              >
                Delete
              </Button>
            </Box>
          )}
        </Grid>

        {/* Book Details */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {book.title}
          </Typography>

          {/* Authors */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="h6" color="text.secondary">
              By: {book.authors.map((author, index) => (
                <React.Fragment key={author.id}>
                  {index > 0 && ', '}
                  <Link
                    component={RouterLink}
                    to={`/books?authorId=${author.id}`}
                    color="primary"
                    sx={{ textDecoration: 'none' }}
                  >
                    {author.name}
                  </Link>
                </React.Fragment>
              ))}
            </Typography>
          </Box>

          {/* Publication Year */}
          {book.publicationYear && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
              <Typography variant="body1">
                Published: {book.publicationYear}
              </Typography>
            </Box>
          )}

          {/* ISBN */}
          {book.isbn && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BookIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
              <Typography variant="body1">
                ISBN: {book.isbn}
              </Typography>
            </Box>
          )}

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
            <Rating 
              value={book.averageRating || 0} 
              precision={0.5} 
              readOnly 
            />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {book.averageRating ? book.averageRating.toFixed(1) : 'No ratings'} 
              ({book.reviewCount || 0} reviews)
            </Typography>
          </Box>

          {/* Categories */}
          {book.categories && book.categories.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CategoryIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                <Typography variant="body1" fontWeight="medium">
                  Categories:
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {book.categories.map((category) => (
                  <Chip 
                    key={category.id} 
                    label={category.name} 
                    variant="filled"
                    component={RouterLink}
                    to={`/books?categoryId=${category.id}`}
                    clickable
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Description */}
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Description
          </Typography>
          {book.description ? (
            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No description available for this book.
            </Typography>
          )}

          {/* Author Details */}
          {book.authors && book.authors.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom fontWeight="medium">
                About the Author{book.authors.length > 1 ? 's' : ''}
              </Typography>
              
              <Stack spacing={3}>
                {book.authors.map((author) => (
                  <Paper key={author.id} sx={{ p: 2, borderRadius: 2 }} variant="outlined">
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ mr: 2 }}>
                        {author.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="medium">
                        <Link
                          component={RouterLink}
                          to={`/books?authorId=${author.id}`}
                          color="inherit"
                          sx={{ textDecoration: 'none' }}
                        >
                          {author.name}
                        </Link>
                      </Typography>
                    </Box>
                    {author.biography ? (
                      <Typography variant="body2">
                        {author.biography}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No biography available for this author.
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Grid>
      </Grid>
      
      {/* Reviews and Comments Tabs */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<RateReviewIcon />} 
            label="Reviews" 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            icon={<ChatBubbleOutlineIcon />} 
            label="Comments" 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
        
        {/* Reviews Panel */}
        <div
          role="tabpanel"
          hidden={activeTab !== 0}
          id="tabpanel-0"
          aria-labelledby="tab-0"
        >
          {activeTab === 0 && <ReviewList bookId={book.id} />}
        </div>
        
        {/* Comments Panel */}
        <div
          role="tabpanel"
          hidden={activeTab !== 1}
          id="tabpanel-1"
          aria-labelledby="tab-1"
        >
          {activeTab === 1 && <CommentList bookId={book.id} />}
        </div>
      </Box>

      {/* Back button */}
      <Box sx={{ mt: 5, mb: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/books" 
          variant="outlined"
        >
          Back to Book List
        </Button>
      </Box>
    </Container>
  );
};

export default BookDetailPage;
