// src/components/book/BookFilters.jsx
import React, { useState, useEffect } from 'react';
import { 
  Paper,
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import { genreApi } from '../../api/bookApi';

const BookFilters = ({ onFilterChange, initialFilters }) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    searchTerm: '',
    genreId: '', // Changed from categoryId to genreId
    sortBy: 'averageRating', // Changed default from 'createdAt' to 'averageRating'
    sortDir: 'desc',
    // Note: authorId filtering is now handled by the dedicated AuthorBooksPage
    ...initialFilters
  });
  
  // Add a local state to keep track of search term without triggering search
  const [searchInputValue, setSearchInputValue] = useState(initialFilters?.searchTerm || '');
  
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);

  // Sort options
  const sortOptions = [
    { value: 'averageRating', label: 'Rating' }, // Moved to top as new default
    { value: 'title', label: 'Title' },
    { value: 'publicationYear', label: 'Publication Year' }
  ];

  // Fetch genres for filter dropdowns
  useEffect(() => {
    // Fetch genres
    const fetchGenres = async () => {
      setGenresLoading(true);
      try {
        const response = await genreApi.getAllGenres();
        console.log('Genres API response:', response);
        setGenres(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching genres:', error);
        setGenres([]);
      } finally {
        setGenresLoading(false);
      }
    };

    // Execute fetch operation
    fetchGenres();
  }, []);

  // Initialize search input with initial filter
  useEffect(() => {
    if (initialFilters?.searchTerm) {
      setSearchInputValue(initialFilters.searchTerm);
    }
  }, [initialFilters?.searchTerm]);

  // Handle filter changes for non-search filters
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    
    // Don't automatically apply search term changes
    if (name === 'searchTerm') {
      setSearchInputValue(value);
      return;
    }
    
    const updatedFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Handle search input change without triggering search
  const handleSearchInputChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    
    // Apply the search term from input to filters
    const updatedFilters = {
      ...filters,
      searchTerm: searchInputValue
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.background.paper
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: theme.palette.text.primary,
          mb: 2
        }}
      >
        <FilterAltIcon sx={{ mr: 1 }} />
        Filter Books
      </Typography>
      
      <Grid container spacing={3}>
        {/* Search */}
        <Grid item xs={12} md={6}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              name="searchTerm"
              label="Search books"
              variant="outlined"
              value={searchInputValue}
              onChange={handleSearchInputChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Grid>
        
        {/* Genre Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="genre-filter-label">Genre</InputLabel>
            <Select
              labelId="genre-filter-label"
              id="genre-filter"
              name="genreId" // Changed from categoryId to genreId
              value={filters.genreId}
              onChange={handleFilterChange}
              label="Genre"
              disabled={genresLoading}
            >
              <MenuItem value="">
                <em>All Genres</em>
              </MenuItem>
              {genres.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SortIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ mr: 2 }}>Sort by:</Typography>
            
            {/* Sort By */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
              <Select
                id="sort-by"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                displayEmpty
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Sort Direction */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
              <Select
                id="sort-direction"
                name="sortDir"
                value={filters.sortDir}
                onChange={handleFilterChange}
                displayEmpty
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BookFilters;
