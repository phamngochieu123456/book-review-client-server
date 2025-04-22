// src/components/comment/CommentForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { commentApi } from '../../api/reviewCommentApi';

const CommentForm = ({ 
  bookId, 
  parentCommentId = null, 
  existingComment = null, 
  onCommentSubmitted,
  onCancel,
  isReply = false
}) => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState(existingComment ? existingComment.content : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Reset form when existingComment changes
  useEffect(() => {
    if (existingComment) {
      setContent(existingComment.content || '');
    } else {
      setContent('');
    }
  }, [existingComment]);

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate content
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      if (existingComment) {
        // Update existing comment
        result = await commentApi.updateComment(existingComment.id, {
          content: content.trim()
        });
      } else {
        // Create new comment
        result = await commentApi.createComment({
          bookId,
          content: content.trim(),
          parentCommentId
        });
      }
      
      // Clear form
      setContent('');
      
      // Notify parent component
      if (onCommentSubmitted) {
        onCommentSubmitted(result);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err.response?.data?.message || 'Failed to submit comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Please log in to {isReply ? 'reply' : 'comment'}.
      </Alert>
    );
  }

  return (
    <Paper 
      elevation={isReply ? 0 : 1} 
      sx={{ 
        p: isReply ? 0 : 3, 
        mb: 3, 
        borderRadius: 2,
        backgroundColor: isReply ? 'transparent' : 'background.paper'
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={isReply ? 2 : 3}
          placeholder={isReply 
            ? "Write a reply..." 
            : existingComment 
              ? "Edit your comment..." 
              : "Write a comment..."
          }
          value={content}
          onChange={handleContentChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {(existingComment || isReply) && (
            <Button 
              onClick={handleCancelClick}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Submitting...
              </>
            ) : existingComment 
              ? 'Update' 
              : isReply 
                ? 'Reply' 
                : 'Comment'
            }
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentForm;
