// src/api/bookApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Book API methods
export const bookApi = {
  // Get all books with filtering, sorting, and pagination
  getAllBooks: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc', categoryId = null, authorId = null, searchTerm = null) => {
    try {
      const params = { page, size, sortBy, sortDir };
      
      // Add optional filters if they exist
      if (categoryId) params.categoryId = categoryId;
      if (authorId) params.authorId = authorId;
      if (searchTerm) params.searchTerm = searchTerm;
      
      const response = await apiClient.get('/books', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Get book details by ID
  getBookById: async (id) => {
    try {
      const response = await apiClient.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book with id ${id}:`, error);
      throw error;
    }
  },

  // Create a new book (admin only)
  createBook: async (bookData) => {
    try {
      const response = await apiClient.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Update an existing book (admin only)
  updateBook: async (id, bookData) => {
    try {
      const response = await apiClient.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a book (soft delete, admin only)
  deleteBook: async (id) => {
    try {
      await apiClient.delete(`/books/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting book with id ${id}:`, error);
      throw error;
    }
  },

  // Get books by author ID (using the new RESTful endpoint)
  getBooksByAuthor: async (authorId, page = 0, size = 12, sortBy = 'publicationYear', sortDir = 'desc') => {
    try {
      const params = { page, size, sortBy, sortDir };
      const response = await apiClient.get(`/authors/${authorId}/books`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching books for author ID ${authorId}:`, error);
      throw error;
    }
  }
};

// Author API methods
export const authorApi = {
  // We'll need to get authors for dropdowns in forms
  getAllAuthors: async () => {
    try {
      const response = await apiClient.get('/authors');
      return response.data;
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw error;
    }
  },
  
  // Get author by ID
  getAuthorById: async (id) => {
    try {
      const response = await apiClient.get(`/authors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching author with id ${id}:`, error);
      throw error;
    }
  }
};

// Category API methods
export const categoryApi = {
  // We'll need to get categories for dropdowns in forms
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

// Genre API methods
export const genreApi = {
  // Get all genres
  getAllGenres: async () => {
    try {
      const response = await apiClient.get('/genres');
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }
};

export default apiClient;
