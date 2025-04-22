// src/components/review/ReviewList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  CircularProgress, 
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Button
} from '@mui/material';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { reviewApi } from '../../api/reviewCommentApi';
import { useAuth } from '../../context/AuthContext';
import RateReviewIcon from '@mui/icons-material/RateReview';

const ReviewList = ({ bookId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [userReview, setUserReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  
  // Load reviews
  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getBookReviews(bookId, page, 10, sortBy, sortDir);
      setReviews(response.content || []);
      setPageCount(response.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load current user's review
  const loadUserReview = async () => {
    if (!isAuthenticated) return;
    
    try {
      const review = await reviewApi.getCurrentUserReviewForBook(bookId);
      setUserReview(review);
    } catch (err) {
      console.error('Error fetching user review:', err);
      // Don't set an error, this is not critical
    }
  };
  
  // Initial load
  useEffect(() => {
    loadReviews();
    loadUserReview();
  }, [bookId, isAuthenticated]);
  
  // Reload when page or sort changes
  useEffect(() => {
    loadReviews();
  }, [page, sortBy, sortDir]);
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value - 1); // API is 0-based, MUI Pagination is 1-based
  };
  
  // Handle sort change
  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    setPage(0); // Reset to first page
  };
  
  const handleSortDirChange = (event) => {
    setSortDir(event.target.value);
    setPage(0); // Reset to first page
  };
  
  // Handle review submission
  const handleReviewSubmitted = (review) => {
    setUserReview(review);
    setEditingReview(null);
    setShowWriteReview(false);
    loadReviews(); // Reload all reviews to get the updated list
  };
  
  // Handle review deletion
  const handleReviewDeleted = (reviewId) => {
    // Update local state to remove the deleted review
    setReviews(reviews.filter(review => review.id !== reviewId));
    
    // If it was the user's review, clear that too
    if (userReview && userReview.id === reviewId) {
      setUserReview(null);
    }
  };
  
  // Handle edit click
  const handleEditClick = (review) => {
    setEditingReview(review);
    setShowWriteReview(true);
    
    // Scroll to review form
    document.getElementById('review-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <RateReviewIcon sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
        <Typography variant="h5" component="h2" fontWeight="medium">
          Reviews
        </Typography>
      </Box>
      
      {/* Write/Edit Review Section */}
      <div id="review-form-section">
        {isAuthenticated && (userReview || showWriteReview) ? (
          <ReviewForm 
            bookId={bookId} 
            existingReview={editingReview || userReview} 
            onReviewSubmitted={handleReviewSubmitted} 
          />
        ) : (
          isAuthenticated && (
            <Box sx={{ mb: 4 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setShowWriteReview(true)}
              >
                Write a Review
              </Button>
            </Box>
          )
        )}
      </div>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Reviews List Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h6">
          {reviews.length > 0 ? `${reviews.length} Review(s)` : 'No Reviews Yet'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortByChange}
            >
              <MenuItem value="createdAt">Date</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-dir-label">Order</InputLabel>
            <Select
              labelId="sort-dir-label"
              value={sortDir}
              label="Order"
              onChange={handleSortDirChange}
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Loading State */}
      {loading && page === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : reviews.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            backgroundColor: 'grey.50'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to share your thoughts!
          </Typography>
        </Paper>
      ) : (
        // Reviews List
        <Box>
          {reviews.map((review) => (
            <ReviewItem 
              key={review.id} 
              review={review} 
              onReviewDeleted={handleReviewDeleted}
              onEditClick={handleEditClick}
            />
          ))}
          
          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pageCount} 
                page={page + 1} // API is 0-based, MUI Pagination is 1-based
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ReviewList;
