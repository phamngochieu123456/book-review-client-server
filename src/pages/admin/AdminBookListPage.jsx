// src/pages/admin/AdminBookListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  InputBase
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InputIcon from '@mui/icons-material/Input';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import { bookApi } from '../../api/bookApi';

const AdminBookListPage = () => {
  const theme = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate state for input
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Custom page navigation
  const [customPage, setCustomPage] = useState('');
  const [customPageError, setCustomPageError] = useState('');
  const [pageCount, setPageCount] = useState(0);

  // Fetch books based on pagination and search
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await bookApi.getAllBooks(
          page, 
          rowsPerPage, 
          'title',
          'asc',
          null,
          null,
          searchTerm || null
        );
        
        setBooks(response.content || []);
        setTotalElements(response.totalElements || 0);
        // Calculate total pages
        setPageCount(Math.ceil(response.totalElements / rowsPerPage) || 0);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, [page, rowsPerPage, searchTerm]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setCustomPage('');
    setCustomPageError('');
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setCustomPage('');
    setCustomPageError('');
  };
  
  // Handle search input change (doesn't trigger search)
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(searchInput);
    setPage(0); // Reset to first page when search changes
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
    setPage(pageNum - 1); // API is 0-based
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };
  
  // Delete the book
  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await bookApi.deleteBook(bookToDelete.id);
      
      // Remove the deleted book from the list
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      setTotalElements(prev => prev - 1);
      
      // Close the dialog
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Render loading state
  if (loading && page === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GroupWorkIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1">
            Book Management
          </Typography>
        </Box>
        
        <Button
          component={RouterLink}
          to="/admin/books/create"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add New Book
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Search box */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            placeholder="Search books by title or description..."
            variant="outlined"
            value={searchInput}
            onChange={handleSearchInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    size="small"
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Paper>
      
      {/* Book table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No books found. {searchTerm && 'Try adjusting your search criteria.'}
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {book.coverImageUrl && (
                        <Box
                          component="img"
                          src={book.coverImageUrl}
                          alt={book.title}
                          sx={{ width: 40, height: 60, mr: 2, objectFit: 'cover' }}
                        />
                      )}
                      <Typography
                        component={RouterLink}
                        to={`/books/${book.id}`}
                        sx={{ 
                          color: 'primary.main', 
                          textDecoration: 'none', 
                          '&:hover': { textDecoration: 'underline' } 
                        }}
                      >
                        {book.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {book.authors?.map(author => author.name).join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {book.categories?.slice(0, 2).map((category) => (
                        <Chip
                          key={category.id}
                          label={category.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {book.categories?.length > 2 && (
                        <Chip
                          label={`+${book.categories.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {book.publicationYear || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {book.averageRating ? `${book.averageRating.toFixed(1)} (${book.reviewCount})` : 'No ratings'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Book">
                      <IconButton
                        component={RouterLink}
                        to={`/admin/books/edit/${book.id}`}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Book">
                      <IconButton
                        onClick={() => handleDeleteClick(book)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination - Modified with custom page navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        mt: 2 
      }}>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
        
        {/* Custom page navigation */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 1
        }}>
          <Typography variant="body2">Go to page:</Typography>
          <TextField
            size="small"
            value={customPage}
            onChange={handleCustomPageChange}
            sx={{ width: 70 }}
            type="number"
            inputProps={{ min: 1, max: pageCount }}
            error={Boolean(customPageError)}
            helperText={customPageError}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGoToPage();
              }
            }}
          />
          <Typography variant="body2" sx={{ mx: 0.5 }}>of {pageCount}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGoToPage}
            size="small"
            startIcon={<InputIcon />}
          >
            Go
          </Button>
        </Box>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBookListPage;
