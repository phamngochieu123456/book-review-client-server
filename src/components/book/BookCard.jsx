// src/components/book/BookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Rating,
  CardActionArea
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
}));

const CardMediaStyled = styled(CardMedia)({
  paddingTop: '140%', // 7:5 aspect ratio
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const TruncatedTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  height: '3em',
});

const BookCard = ({ book }) => {
  // Default image if no cover is available
  const coverImage = book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover+Available';

  return (
    <StyledCard>
      <CardActionArea component={Link} to={`/books/${book.id}`}>
        <CardMediaStyled
          image={coverImage}
          title={book.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
            {book.title}
          </Typography>
          
          {/* Authors */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {book.authors && book.authors.length > 0 
                ? book.authors.map(author => author.name).join(', ') 
                : 'Unknown Author'}
            </Typography>
          </Box>
          
          {/* Year */}
          {book.publicationYear && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {book.publicationYear}
            </Typography>
          )}
          
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating 
              value={book.averageRating || 0} 
              precision={0.5} 
              readOnly 
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({book.reviewCount || 0})
            </Typography>
          </Box>
          
          {/* Genres (replaces Categories) */}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {book.genres && book.genres.slice(0, 3).map((genre) => (
              <Chip 
                key={genre.id} 
                label={genre.name} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </StyledCard>
  );
};

export default BookCard;
