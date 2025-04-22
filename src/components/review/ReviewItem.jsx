// src/components/review/ReviewItem.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Rating, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../api/reviewCommentApi';
import { formatDistanceToNow } from 'date-fns';

const ReviewItem = ({ review, onReviewDeleted, onEditClick }) => {
  const theme = useTheme();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current user is the author of this review
  const isAuthor = isAuthenticated && user && user.id === review.userId;
  
  // Format the date
  const formattedDate = review.createdAt 
    ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
    : '';

  // Menu handling
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Delete dialog handling
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    try {
      await reviewApi.deleteReview(review.id);
      setDeleteDialogOpen(false);
      
      // Notify parent component
      if (onReviewDeleted) {
        onReviewDeleted(review.id);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      // You could add error handling here
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit handling
  const handleEditClick = () => {
    handleMenuClose();
    if (onEditClick) {
      onEditClick(review);
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        mb: 2, 
        borderRadius: 2,
        position: 'relative'
      }}
    >
      {/* Options menu (for author or admin) */}
      {(isAuthor || isAdmin) && (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton 
            size="small"
            onClick={handleMenuOpen}
            aria-label="review options"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {isAuthor && (
              <MenuItem onClick={handleEditClick}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>
            )}
            <MenuItem onClick={handleDeleteClick}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      )}
      
      {/* User info and rating */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar 
          alt={review.username}
          src="/static/images/avatar/1.jpg" // You could use a real avatar URL here
          sx={{ mr: 2 }}
        >
          {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            {review.username || 'Anonymous User'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating 
              value={review.rating} 
              readOnly 
              precision={0.5}
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {formattedDate}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Review content */}
      {review.comment && (
        <Typography variant="body1" paragraph sx={{ mt: 2, whiteSpace: 'pre-line' }}>
          {review.comment}
        </Typography>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReviewItem;
