// src/pages/AuthorBooksPage.jsx
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
  Paper,
  Button,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import BookCard from '../components/book/BookCard';
import { bookApi, authorApi } from '../api/bookApi';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PersonIcon from '@mui/icons-material/Person';
import SortIcon from '@mui/icons-material/Sort';
import InputIcon from '@mui/icons-material/Input';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * AuthorBooksPage Component
 * 
 * A dedicated page for viewing books by a specific author.
 * This component solves the race condition issue by making a single API call
 * to fetch books by author, instead of mixing author filtering with other filters.
 */
const AuthorBooksPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  // Get authorId from URL params
  const { authorId } = useParams();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorLoading, setAuthorLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [author, setAuthor] = useState(null);
  const [filters, setFilters] = useState({
    page: 0,
    size: 24, // Fixed page size to 24
    sortBy: 'publicationYear', // Default sort for author books - chronological
    sortDir: 'desc'
  });
  
  // Custom page navigation
  const [customPage, setCustomPage] = useState('');
  const [customPageError, setCustomPageError] = useState('');

  // Fetch author details
  useEffect(() => {
    const fetchAuthor = async () => {
      setAuthorLoading(true);
      try {
        const authorData = await authorApi.getAuthorById(authorId);
        setAuthor(authorData);
      } catch (err) {
        console.error('Error fetching author details:', err);
        setError('Author not found or an error occurred while loading author details.');
      } finally {
        setAuthorLoading(false);
      }
    };

    if (authorId) {
      fetchAuthor();
    }
  }, [authorId]);

  // Load books from API using the dedicated author books endpoint
  useEffect(() => {
    const fetchBooks = async () => {
      if (!authorId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { page, size, sortBy, sortDir } = filters;
        
        // Use the dedicated author books endpoint
        const response = await bookApi.getBooksByAuthor(
          authorId,
          page,
          size,
          sortBy,
          sortDir
        );
        
        setBooks(response.content || []);
        setPageCount(response.totalPages || 0);
      } catch (err) {
        console.error('Error fetching author books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [authorId, filters]);

  // Handle sorting change
  const handleSortChange = (event) => {
    const { name, value } = event.target;
    
    // Update filters and reset to first page
    setFilters({
      ...filters,
      [name]: value,
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

  // Get appropriate title based on loading state and author data
  const getPageTitle = () => {
    if (authorLoading) {
      return 'Loading Author Details...';
    }
    
    if (author) {
      return `Books by ${author.name}`;
    }
    
    return 'Author Books';
  };

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
        <Typography color="text.primary">
          {getPageTitle()}
        </Typography>
      </Breadcrumbs>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" color="text.primary" fontWeight="bold">
            {getPageTitle()}
          </Typography>
        </Box>
        
        <Button
          component={RouterLink}
          to="/books"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          All Books
        </Button>
      </Box>
      
      {/* Author biography */}
      {author && author.biography && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: theme.shape.borderRadius 
          }}
        >
          <Typography variant="h6" gutterBottom>About the Author</Typography>
          <Typography variant="body1">{author.biography}</Typography>
        </Paper>
      )}
      
      {/* Sorting controls */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: theme.shape.borderRadius 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <LibraryBooksIcon sx={{ mr: 1 }} />
            {loading ? 'Loading books...' : `${books.length > 0 ? books.length : 'No'} Books Found`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SortIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ mr: 2 }}>Sort by:</Typography>
            
            {/* Sort By Field */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
              <Select
                id="sort-by"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleSortChange}
                displayEmpty
              >
                <MenuItem value="publicationYear">Publication Year</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="averageRating">Rating</MenuItem>
              </Select>
            </FormControl>
            
            {/* Sort Direction */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select
                id="sort-direction"
                name="sortDir"
                value={filters.sortDir}
                onChange={handleSortChange}
                displayEmpty
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
      
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
              No books found for this author. The author may not have any books in the system yet.
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

export default AuthorBooksPage;
