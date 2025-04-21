// src/pages/admin/AdminBookEditPage.jsx
import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookForm from '../../components/admin/BookForm';

const AdminBookEditPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isEditMode = Boolean(id);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link component={RouterLink} to="/admin" color="inherit">
          Admin
        </Link>
        <Link component={RouterLink} to="/admin/books" color="inherit">
          Books
        </Link>
        <Typography color="text.primary">
          {isEditMode ? 'Edit Book' : 'Create Book'}
        </Typography>
      </Breadcrumbs>
      
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <EditIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Book' : 'Create New Book'}
        </Typography>
      </Box>
      
      {/* Back button */}
      <Box sx={{ mb: 4 }}>
        <Link
          component={RouterLink}
          to="/admin/books"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            textDecoration: 'none',
            '&:hover': {
              color: theme.palette.primary.main,
            }
          }}
        >
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Back to Book List
        </Link>
      </Box>
      
      {/* Book form */}
      <BookForm bookId={isEditMode ? id : null} />
    </Container>
  );
};

export default AdminBookEditPage;
