// src/components/review/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Rating, 
  TextField, 
  Button, 
  Alert, 
  Paper,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../api/reviewCommentApi';

const ReviewForm = ({ bookId, existingReview, onReviewSubmitted }) => {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Reset form when existingReview changes
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview]);

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Clear previous notifications
    setError(null);
    setSuccess(null);
    
    // Validate rating
    if (!rating) {
      setError('Please select a rating before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      const reviewData = {
        bookId,
        rating,
        comment
      };
      
      let result;
      
      if (existingReview) {
        // Update existing review
        result = await reviewApi.updateReview(existingReview.id, {
          rating,
          comment
        });
        setSuccess('Your review has been updated!');
      } else {
        // Create new review
        result = await reviewApi.createReview(reviewData);
        setSuccess('Your review has been submitted!');
      }
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(result);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Alert severity="info">
          Please log in to leave a review.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography component="legend" gutterBottom>
            Your Rating
          </Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={handleRatingChange}
            precision={1}
            size="large"
          />
        </Box>
        
        <TextField
          fullWidth
          label="Your Review (Optional)"
          multiline
          rows={4}
          value={comment}
          onChange={handleCommentChange}
          variant="outlined"
          margin="normal"
          placeholder="Share your thoughts about this book..."
        />
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Submitting...
              </>
            ) : existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewForm;
