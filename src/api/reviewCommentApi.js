// src/api/reviewCommentApi.js
import apiClient from './bookApi';

// Review API methods
export const reviewApi = {
  // Get all reviews for a book with pagination
  getBookReviews: async (bookId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const response = await apiClient.get(`/books/${bookId}/reviews`, {
        params: { page, size, sortBy, sortDir }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for book ${bookId}:`, error);
      throw error;
    }
  },

  // Get the current user's review for a book
  getCurrentUserReviewForBook: async (bookId) => {
    try {
      const response = await apiClient.get(`/books/${bookId}/my-review`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // User has no review for this book
      }
      console.error(`Error fetching current user's review for book ${bookId}:`, error);
      throw error;
    }
  },

  // Get all reviews by a user
  getUserReviews: async (userId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const response = await apiClient.get(`/users/${userId}/reviews`, {
        params: { page, size, sortBy, sortDir }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews by user ${userId}:`, error);
      throw error;
    }
  },

  // Get a review by ID
  getReviewById: async (reviewId) => {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching review with id ${reviewId}:`, error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (reviewData) => {
    try {
      const response = await apiClient.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Update an existing review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error updating review with id ${reviewId}:`, error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      await apiClient.delete(`/reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting review with id ${reviewId}:`, error);
      throw error;
    }
  }
};

// Comment API methods
export const commentApi = {
  // Get all comments for a book with pagination
  getBookComments: async (bookId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const response = await apiClient.get(`/books/${bookId}/comments`, {
        params: { page, size, sortBy, sortDir }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for book ${bookId}:`, error);
      throw error;
    }
  },

  // Get replies to a specific comment
  getCommentReplies: async (commentId) => {
    try {
      const response = await apiClient.get(`/comments/${commentId}/replies`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching replies for comment ${commentId}:`, error);
      throw error;
    }
  },

  // Get a comment by ID
  getCommentById: async (commentId) => {
    try {
      const response = await apiClient.get(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment with id ${commentId}:`, error);
      throw error;
    }
  },

  // Create a new comment
  createComment: async (commentData) => {
    try {
      const response = await apiClient.post('/comments', commentData);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Update an existing comment
  updateComment: async (commentId, commentData) => {
    try {
      const response = await apiClient.put(`/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating comment with id ${commentId}:`, error);
      throw error;
    }
  },

  // Delete a comment (soft delete)
  deleteComment: async (commentId) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting comment with id ${commentId}:`, error);
      throw error;
    }
  }
};

// Reaction API methods
export const reactionApi = {
  // Toggle a reaction
  toggleReaction: async (reactionData) => {
    try {
      const response = await apiClient.post('/reactions', reactionData);
      return response.data;
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  },

  // Get reaction summary for an item
  getReactionSummary: async (reactableType, reactableId) => {
    try {
      const response = await apiClient.get(`/reactions/${reactableType}/${reactableId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reaction summary for ${reactableType} ${reactableId}:`, error);
      throw error;
    }
  },

  // Get current user's reaction for an item
  getCurrentUserReaction: async (reactableType, reactableId) => {
    try {
      const response = await apiClient.get(`/reactions/${reactableType}/${reactableId}/my-reaction`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // User has no reaction for this item
      }
      console.error(`Error fetching current user's reaction for ${reactableType} ${reactableId}:`, error);
      throw error;
    }
  }
};

export default { reviewApi, commentApi, reactionApi };
