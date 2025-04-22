// src/components/comment/CommentList.jsx
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
  Skeleton
} from '@mui/material';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { commentApi } from '../../api/reviewCommentApi';
import { useAuth } from '../../context/AuthContext';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const CommentList = ({ bookId }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  
  // Load comments
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentApi.getBookComments(bookId, page, 10, sortBy, sortDir);
      setComments(response.content || []);
      setPageCount(response.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadComments();
  }, [bookId]);
  
  // Reload when page or sort changes
  useEffect(() => {
    loadComments();
  }, [page, sortBy, sortDir]);
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value - 1); // API is 0-based, MUI Pagination is 1-based
  };
  
  // Handle sort change
  const handleSortDirChange = (event) => {
    setSortDir(event.target.value);
    setPage(0); // Reset to first page
  };
  
  // Handle new comment submission
  const handleCommentSubmitted = (newComment) => {
    // For top-level comments, add to the list and reload
    if (!newComment.parentCommentId) {
      // If we're on the first page and sorted by newest first, add to the top
      if (page === 0 && sortBy === 'createdAt' && sortDir === 'desc') {
        setComments([newComment, ...comments]);
      } else {
        // Otherwise, reload all comments to get the correct order
        loadComments();
      }
    }
  };
  
  // Handle comment deletion
  const handleCommentDeleted = (commentId) => {
    // Update local state to remove the deleted comment and its replies
    const removeComment = (commentsArray, id) => {
      return commentsArray.filter(comment => {
        // Keep all comments except the deleted one
        if (comment.id === id) return false;
        
        // Recursively filter replies
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = removeComment(comment.replies, id);
        }
        
        return true;
      });
    };
    
    setComments(removeComment(comments, commentId));
  };
  
  // Handle comment update
  const handleCommentUpdated = (updatedComment) => {
    // Update the comment in the local state
    const updateComment = (commentsArray, updatedComment) => {
      return commentsArray.map(comment => {
        // Update the matching comment
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        }
        
        // Recursively update in replies
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = updateComment(comment.replies, updatedComment);
        }
        
        return comment;
      });
    };
    
    setComments(updateComment(comments, updatedComment));
  };
  
  // Handle reply added
  const handleReplyAdded = (newReply) => {
    // Find the parent comment and add the reply
    const addReply = (commentsArray, parentId, newReply) => {
      return commentsArray.map(comment => {
        // If this is the parent, add the reply
        if (comment.id === parentId) {
          const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
          return { ...comment, replies: updatedReplies };
        }
        
        // Recursively check in replies
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = addReply(comment.replies, parentId, newReply);
        }
        
        return comment;
      });
    };
    
    setComments(addReply(comments, newReply.parentCommentId, newReply));
  };
  
  return (
    <Box sx={{ mt: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ChatBubbleOutlineIcon sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
        <Typography variant="h5" component="h2" fontWeight="medium">
          Comments
        </Typography>
      </Box>
      
      {/* New comment form */}
      {isAuthenticated && (
        <Box sx={{ mb: 4 }}>
          <CommentForm 
            bookId={bookId} 
            onCommentSubmitted={handleCommentSubmitted} 
          />
        </Box>
      )}
      
      <Divider sx={{ my: 4 }} />
      
      {/* Comments List Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h6">
          {loading ? (
            <Skeleton width={100} />
          ) : (
            `${comments.length > 0 ? comments.length : 'No'} Comment${comments.length !== 1 ? 's' : ''}`
          )}
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="sort-dir-label">Sort By</InputLabel>
          <Select
            labelId="sort-dir-label"
            value={sortDir}
            label="Sort By"
            onChange={handleSortDirChange}
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Loading State */}
      {loading ? (
        <Box sx={{ mb: 4 }}>
          {[1, 2, 3].map(i => (
            <Paper key={i} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
                <Box>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="text" width={80} />
                </Box>
              </Box>
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </Paper>
          ))}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : comments.length === 0 ? (
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
            No comments yet. Be the first to start the conversation!
          </Typography>
        </Paper>
      ) : (
        // Comments List
        <Box>
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              bookId={bookId}
              onCommentDeleted={handleCommentDeleted}
              onCommentUpdated={handleCommentUpdated}
              onReplyAdded={handleReplyAdded}
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

export default CommentList;
