// src/components/admin/BookForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  Typography,
  Grid,
  Chip,
  OutlinedInput,
  FormHelperText,
  Divider,
  useTheme,
  Alert,
  CircularProgress
} from '@mui/material';
import { bookApi, authorApi, genreApi } from '../../api/bookApi';

// ISBN validation regex
const isbnRegex = /^(97(8|9))?\d{9}(\d|X)$/;

const BookForm = ({ bookId = null }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isEditMode = Boolean(bookId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isbn: '',
    coverImageUrl: '',
    publicationYear: '',
    authorIds: [],
    genreIds: [] // Changed from categoryIds to genreIds
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Options for select inputs
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]); // Changed from categories to genres
  
  // Fetch authors and genres on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsData, genresData] = await Promise.all([
          authorApi.getAllAuthors(),
          genreApi.getAllGenres() // Changed from categoryApi to genreApi
        ]);
        
        setAuthors(authorsData.content || []);
        setGenres(genresData || []); // Changed from categories to genres
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load authors and genres. Please try again.');
      }
    };
    
    fetchData();
  }, []);
  
  // If in edit mode, fetch book data
  useEffect(() => {
    if (isEditMode) {
      const fetchBook = async () => {
        setLoading(true);
        try {
          const bookData = await bookApi.getBookById(bookId);
          
          // Map the book data to form data
          setFormData({
            title: bookData.title || '',
            description: bookData.description || '',
            isbn: bookData.isbn || '',
            coverImageUrl: bookData.coverImageUrl || '',
            publicationYear: bookData.publicationYear || '',
            authorIds: bookData.authors?.map(author => author.id) || [],
            genreIds: bookData.genres?.map(genre => genre.id) || [] // Map genres to genreIds
          });
        } catch (err) {
          console.error('Error fetching book:', err);
          setError('Failed to load book data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchBook();
    }
  }, [bookId, isEditMode]);
  
  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle multi-select change (authors and genres)
  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Title is required
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title cannot exceed 255 characters';
    }
    
    // ISBN must match format if provided
    if (formData.isbn && !isbnRegex.test(formData.isbn)) {
      newErrors.isbn = 'ISBN format is invalid';
    }
    
    // Cover image URL max length
    if (formData.coverImageUrl && formData.coverImageUrl.length > 500) {
      newErrors.coverImageUrl = 'Cover image URL cannot exceed 500 characters';
    }
    
    // Publication year must be a valid year
    if (formData.publicationYear) {
      const year = parseInt(formData.publicationYear, 10);
      const currentYear = new Date().getFullYear();
      
      if (isNaN(year) || year < 1000 || year > currentYear + 5) {
        newErrors.publicationYear = `Year must be between 1000 and ${currentYear + 5}`;
      }
    }
    
    // Must have at least one author
    if (!formData.authorIds.length) {
      newErrors.authorIds = 'At least one author must be selected';
    }
    
    // Must have at least one genre
    if (!formData.genreIds.length) {
      newErrors.genreIds = 'At least one genre must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Format public year as Number
      const formattedData = {
        ...formData,
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear, 10) : null
      };
      
      if (isEditMode) {
        // Update existing book
        await bookApi.updateBook(bookId, formattedData);
        setSuccess('Book updated successfully!');
      } else {
        // Create new book
        await bookApi.createBook(formattedData);
        setSuccess('Book created successfully!');
        
        // Clear form after successful creation
        setFormData({
          title: '',
          description: '',
          isbn: '',
          coverImageUrl: '',
          publicationYear: '',
          authorIds: [],
          genreIds: []
        });
      }
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/admin/books');
      }, 1500);
    } catch (err) {
      console.error('Error saving book:', err);
      
      // Handle API validation errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError('Failed to save book. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/admin/books');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEditMode ? 'Edit Book' : 'Add New Book'}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              error={Boolean(errors.title)}
              helperText={errors.title}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
          
          {/* ISBN */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ISBN"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              error={Boolean(errors.isbn)}
              helperText={errors.isbn || 'Format: ISBN-10 or ISBN-13'}
              inputProps={{ maxLength: 20 }}
            />
          </Grid>
          
          {/* Publication Year */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Publication Year"
              name="publicationYear"
              type="number"
              value={formData.publicationYear}
              onChange={handleChange}
              error={Boolean(errors.publicationYear)}
              helperText={errors.publicationYear}
              InputProps={{ inputProps: { min: 1000, max: new Date().getFullYear() + 5 } }}
            />
          </Grid>
          
          {/* Cover Image URL */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cover Image URL"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              error={Boolean(errors.coverImageUrl)}
              helperText={errors.coverImageUrl}
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
          
          {/* Authors */}
          <Grid item xs={12} sm={6} md={6}>
            <FormControl 
              fullWidth 
              error={Boolean(errors.authorIds)}
              required
            >
              <InputLabel id="authors-label">Authors</InputLabel>
              <Select
                labelId="authors-label"
                multiple
                name="authorIds"
                value={formData.authorIds}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="Authors" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((authorId) => {
                      const author = authors.find(a => a.id === authorId);
                      return (
                        <Chip 
                          key={authorId} 
                          label={author ? author.name : 'Unknown'}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {authors.map((author) => (
                  <MenuItem key={author.id} value={author.id}>
                    {author.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.authorIds && <FormHelperText>{errors.authorIds}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Genres */}
          <Grid item xs={12} sm={6} md={6}>
            <FormControl 
              fullWidth 
              error={Boolean(errors.genreIds)}
              required
            >
              <InputLabel id="genres-label">Genres</InputLabel>
              <Select
                labelId="genres-label"
                multiple
                name="genreIds"  // Changed from categoryIds to genreIds
                value={formData.genreIds}
                onChange={handleMultiSelectChange}
                input={<OutlinedInput label="Genres" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((genreId) => {
                      const genre = genres.find(g => g.id === genreId);
                      return (
                        <Chip 
                          key={genreId} 
                          label={genre ? genre.name : 'Unknown'}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {genres.map((genre) => (
                  <MenuItem key={genre.id} value={genre.id}>
                    {genre.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.genreIds && <FormHelperText>{errors.genreIds}</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={5}
              error={Boolean(errors.description)}
              helperText={errors.description}
            />
          </Grid>
          
          {/* Form Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Book' : 'Create Book'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default BookForm;
