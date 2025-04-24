// src/pages/BookListPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Pagination, 
  CircularProgress,
  Alert,
  useTheme,
  Fade,
  TextField,
  Button,
  InputAdornment,
  Paper
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import BookCard from '../components/book/BookCard';
import BookFilters from '../components/book/BookFilters';
import { bookApi, authorApi } from '../api/bookApi';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import InputIcon from '@mui/icons-material/Input';

const BookListPage = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 0,
    size: 24, // Fixed page size to 24
    sortBy: 'averageRating', // Changed default from 'createdAt' to 'averageRating'
    sortDir: 'desc',
    categoryId: '', // Used for genre filtering (genres share IDs with categories)
    authorId: '',
    searchTerm: ''
  });
  
  // For displaying author name when viewing books by a specific author
  const [authorName, setAuthorName] = useState(null);
  
  // Custom page navigation
  const [customPage, setCustomPage] = useState('');
  const [customPageError, setCustomPageError] = useState('');

  // Extract authorId from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authorId = params.get('authorId');
    
    if (authorId) {
      // Update filters with authorId
      setFilters(prev => ({
        ...prev, 
        authorId,
        // Reset to first page when changing author
        page: 0
      }));
      
      // Fetch author name if we have an authorId
      const fetchAuthorName = async () => {
        try {
          const authorData = await authorApi.getAuthorById(authorId);
          setAuthorName(authorData.name);
        } catch (err) {
          console.error('Error fetching author details:', err);
          setAuthorName('Unknown Author');
        }
      };
      
      fetchAuthorName();
    } else {
      // Reset authorName if no authorId in URL
      setAuthorName(null);
    }
  }, [location.search]);

  // Load books from API
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { 
          page, 
          size, 
          sortBy, 
          sortDir, 
          categoryId, 
          authorId, 
          searchTerm 
        } = filters;
        
        let response;
        
        // Use the dedicated author books endpoint if filtering by author
        if (authorId) {
          response = await bookApi.getBooksByAuthor(
            authorId,
            page,
            size,
            sortBy,
            sortDir
          );
        } else {
          // Otherwise use the general books endpoint with optional filters
          response = await bookApi.getAllBooks(
            page, 
            size, 
            sortBy, 
            sortDir, 
            categoryId || null, 
            null, // Don't pass authorId here as we're using the dedicated endpoint
            searchTerm || null
          );
        }
        
        setBooks(response.content || []);
        setPageCount(response.totalPages || 0);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // If authorId is present in the URL, preserve it 
    // unless explicitly changed in newFilters
    const currentAuthorId = filters.authorId;
    const updatedAuthorId = 
      'authorId' in newFilters ? newFilters.authorId : currentAuthorId;
    
    // Reset to first page when filters change
    setFilters({
      ...filters,
      ...newFilters,
      page: 0,
      authorId: updatedAuthorId
    });
    
    // Reset custom page input
    setCustomPage('');
    setCustomPageError('');
  };

  // Handle pagination change
  const handlePageChange = (event, newPage) => {
    setFilters({
      ...filters,
      page: newPage - 1 // API is 0-based, MUI Pagination is 1-based
    });
    
    // Reset custom page input
    setCustomPage('');
    
    // Scroll to top of page
    window.scrollTo(0, 0);
  };

  // Handle custom page input change
  const handleCustomPageChange = (event) => {
    setCustomPage(event.target.value);
    setCustomPageError('');
  };

  // Handle custom page navigation
  const handleGoToPage = () => {
    // Validate input
    const pageNum = parseInt(customPage, 10);
    
    if (isNaN(pageNum) || pageNum < 1 || pageNum > pageCount) {
      setCustomPageError(`Please enter a valid page number between 1 and ${pageCount}`);
      return;
    }
    
    // Update page
    setFilters({
      ...filters,
      page: pageNum - 1 // API is 0-based
    });
    
    // Scroll to top of page
    window.scrollTo(0, 0);
  };

  // Clear author filter
  const handleClearAuthorFilter = () => {
    // Navigate to books page without authorId parameter
    navigate('/books');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <LibraryBooksIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
        <Typography variant="h4" component="h1" color="text.primary" fontWeight="bold">
          {authorName ? `Books by ${authorName}` : 'Book Collection'}
        </Typography>
      </Box>
      
      {/* Author filter notice */}
      {authorName && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleClearAuthorFilter}
            >
              Show All Books
            </Button>
          }
        >
          Currently showing books by: <strong>{authorName}</strong>
        </Alert>
      )}
      
      {/* Filters */}
      <BookFilters 
        onFilterChange={handleFilterChange} 
        initialFilters={filters}
      />
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading spinner */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Book grid */}
          {books.length === 0 ? (
            <Alert severity="info" sx={{ mt: 4 }}>
              No books found matching your criteria. Try adjusting your filters.
            </Alert>
          ) : (
            <Fade in={!loading}>
              <Grid container spacing={3}>
                {books.map((book) => (
                  <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                    <BookCard book={book} />
                  </Grid>
                ))}
              </Grid>
            </Fade>
          )}
          
          {/* Pagination controls */}
          {pageCount > 0 && (
            <Box sx={{ 
              mt: 6, 
              mb: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              {/* Page information */}
              <Typography variant="body2" color="text.secondary">
                Showing {books.length} books - Page {filters.page + 1} of {pageCount}
              </Typography>
              
              {/* Standard pagination */}
              <Pagination 
                count={pageCount} 
                page={filters.page + 1} // API is 0-based, MUI Pagination is 1-based
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
                showFirstButton
                showLastButton
                siblingCount={1}
              />
              
              {/* Custom page navigation */}
              <Paper
                elevation={1}
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  mt: 2,
                  borderRadius: 2,
                  width: 'fit-content'
                }}
              >
                <Typography variant="body2">Go to page:</Typography>
                <TextField
                  size="small"
                  value={customPage}
                  onChange={handleCustomPageChange}
                  sx={{ width: 120 }}
                  type="number"
                  inputProps={{ min: 1, max: pageCount }}
                  error={Boolean(customPageError)}
                  helperText={customPageError}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleGoToPage();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption">/{pageCount}</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGoToPage}
                  startIcon={<InputIcon />}
                  size="small"
                >
                  Go
                </Button>
              </Paper>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default BookListPage;
