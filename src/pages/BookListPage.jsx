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
import BookCard from '../components/book/BookCard';
import BookFilters from '../components/book/BookFilters';
import { bookApi } from '../api/bookApi';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import InputIcon from '@mui/icons-material/Input';

const BookListPage = () => {
  const theme = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 0,
    size: 24, // Fixed page size to 24
    sortBy: 'createdAt',
    sortDir: 'desc',
    categoryId: '',
    authorId: '',
    searchTerm: ''
  });
  
  // Custom page navigation
  const [customPage, setCustomPage] = useState('');
  const [customPageError, setCustomPageError] = useState('');

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
        
        const response = await bookApi.getAllBooks(
          page, 
          size, 
          sortBy, 
          sortDir, 
          categoryId || null, 
          authorId || null, 
          searchTerm || null
        );
        
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
    // Reset to first page when filters change
    setFilters({
      ...filters,
      ...newFilters,
      page: 0
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <LibraryBooksIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
        <Typography variant="h4" component="h1" color="text.primary" fontWeight="bold">
          Book Collection
        </Typography>
      </Box>
      
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
