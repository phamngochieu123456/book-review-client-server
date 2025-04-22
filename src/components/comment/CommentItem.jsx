// src/components/comment/CommentItem.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
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
  Collapse,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useAuth } from '../../context/AuthContext';
import { commentApi } from '../../api/reviewCommentApi';
import { formatDistanceToNow } from 'date-fns';
import ReactionButtons from '../reaction/ReactionButtons';
import CommentForm from './CommentForm';

const CommentItem = ({ 
  comment, 
  bookId, 
  onCommentDeleted, 
  onCommentUpdated,
  onReplyAdded,
  depth = 0
}) => {
  const theme = useTheme();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const maxDepth = 3; // Maximum nesting depth for replies
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  // Check if current user is the author of this comment
  const isAuthor = isAuthenticated && user && user.id === comment.userId;
  
  // Format the date
  const formattedDate = comment.createdAt 
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
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
      await commentApi.deleteComment(comment.id);
      setDeleteDialogOpen(false);
      
      // Notify parent component
      if (onCommentDeleted) {
        onCommentDeleted(comment.id);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      // You could add error handling here
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit handling
  const handleEditClick = () => {
    handleMenuClose();
    setIsEditing(true);
  };
  
  // Reply handling
  const handleReplyClick = () => {
    setShowReplyForm(true);
  };
  
  // Handle comment update
  const handleCommentUpdated = (updatedComment) => {
    setIsEditing(false);
    
    // Notify parent component
    if (onCommentUpdated) {
      onCommentUpdated(updatedComment);
    }
  };
  
  // Handle reply submission
  const handleReplySubmitted = (newReply) => {
    setShowReplyForm(false);
    setShowReplies(true);
    
    // Notify parent component
    if (onReplyAdded) {
      onReplyAdded(newReply);
    }
  };
  
  // Toggle replies visibility
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <Box sx={{ 
      position: 'relative',
      mt: depth > 0 ? 2 : 0,
      ml: depth * 3, // Indent based on depth
      mb: 2 
    }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          borderLeft: depth > 0 ? `4px solid ${theme.palette.grey[300]}` : 'none'
        }}
      >
        {/* Options menu (for author or admin) */}
        {(isAuthor || isAdmin) && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <IconButton 
              size="small"
              onClick={handleMenuOpen}
              aria-label="comment options"
            >
              <MoreVertIcon fontSize="small" />
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
        
        {/* User info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar 
            alt={comment.username}
            src="/static/images/avatar/1.jpg" // You could use a real avatar URL here
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">
              {comment.username || 'Anonymous User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
        </Box>
        
        {/* Comment content or edit form */}
        {isEditing ? (
          <CommentForm 
            bookId={bookId}
            existingComment={comment}
            onCommentSubmitted={handleCommentUpdated}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Typography variant="body1" sx={{ mt: 1, mb: 2, pl: 0.5 }}>
            {comment.content}
          </Typography>
        )}
        
        {/* Reactions and reply button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mt: 1
        }}>
          <ReactionButtons 
            reactableId={comment.id}
            reactableType="comment"
          />
          
          {isAuthenticated && depth < maxDepth && !isEditing && (
            <Button 
              size="small" 
              startIcon={<ReplyIcon fontSize="small" />}
              onClick={handleReplyClick}
              sx={{ color: 'text.secondary' }}
            >
              Reply
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Reply form */}
      {showReplyForm && (
        <Box sx={{ ml: 4, mt: 2 }}>
          <CommentForm 
            bookId={bookId}
            parentCommentId={comment.id}
            onCommentSubmitted={handleReplySubmitted}
            onCancel={() => setShowReplyForm(false)}
            isReply={true}
          />
        </Box>
      )}
      
      {/* Replies */}
      {hasReplies && (
        <Box sx={{ ml: 4, mt: 1 }}>
          {/* Toggle replies button */}
          {comment.replies.length > 0 && (
            <Button 
              size="small"
              onClick={toggleReplies}
              startIcon={showReplies ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ mb: 1, color: 'text.secondary' }}
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </Button>
          )}
          
          <Collapse in={showReplies}>
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply.id}
                comment={reply}
                bookId={bookId}
                onCommentDeleted={onCommentDeleted}
                onCommentUpdated={onCommentUpdated}
                onReplyAdded={onReplyAdded}
                depth={depth + 1}
              />
            ))}
          </Collapse>
        </Box>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
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
    </Box>
  );
};

export default CommentItem;
