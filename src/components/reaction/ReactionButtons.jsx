// src/components/reaction/ReactionButtons.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { useAuth } from '../../context/AuthContext';
import { reactionApi } from '../../api/reviewCommentApi';

// Available reaction types
const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  HAPPY: 'happy',
  SAD: 'sad'
};

// Icon mapping for each reaction type (filled and outlined versions)
const REACTION_ICONS = {
  [REACTION_TYPES.LIKE]: {
    filled: <ThumbUpIcon fontSize="small" />,
    outlined: <ThumbUpOutlinedIcon fontSize="small" />
  },
  [REACTION_TYPES.LOVE]: {
    filled: <FavoriteIcon fontSize="small" />,
    outlined: <FavoriteBorderIcon fontSize="small" />
  },
  [REACTION_TYPES.HAPPY]: {
    filled: <SentimentVerySatisfiedIcon fontSize="small" />,
    outlined: <SentimentVerySatisfiedIcon fontSize="small" />
  },
  [REACTION_TYPES.SAD]: {
    filled: <SentimentVeryDissatisfiedIcon fontSize="small" />,
    outlined: <SentimentVeryDissatisfiedIcon fontSize="small" />
  }
};

// Colors for each reaction type
const REACTION_COLORS = {
  [REACTION_TYPES.LIKE]: 'primary.main',
  [REACTION_TYPES.LOVE]: '#e91e63', // pink
  [REACTION_TYPES.HAPPY]: '#ffc107', // amber
  [REACTION_TYPES.SAD]: '#9e9e9e'  // grey
};

const ReactionButtons = ({ 
  reactableId, 
  reactableType, 
  onReactionChange 
}) => {
  const { isAuthenticated } = useAuth();
  const [userReaction, setUserReaction] = useState(null);
  const [reactionSummary, setReactionSummary] = useState({ countsByType: {}, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // Quick reaction menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Load user's reaction and reaction summary
  useEffect(() => {
    const loadReactions = async () => {
      try {
        setSummaryLoading(true);
        
        // Load reaction summary
        const summary = await reactionApi.getReactionSummary(reactableType, reactableId);
        setReactionSummary(summary);
        
        // Load user's reaction if authenticated
        if (isAuthenticated) {
          const reaction = await reactionApi.getCurrentUserReaction(reactableType, reactableId);
          setUserReaction(reaction);
        }
      } catch (err) {
        console.error('Error loading reactions:', err);
      } finally {
        setSummaryLoading(false);
      }
    };
    
    loadReactions();
  }, [reactableId, reactableType, isAuthenticated]);
  
  // Toggle reaction
  const handleReactionClick = async (reactionType) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    
    try {
      // Close popover if open
      if (open) {
        handleClose();
      }
      
      const response = await reactionApi.toggleReaction({
        reactableId,
        reactableType,
        reactionType
      });
      
      // Update local state based on the response
      if (response.action === 'added') {
        setUserReaction({ 
          reactableId,
          reactableType,
          reactionType 
        });
      } else {
        setUserReaction(null);
      }
      
      // Reload reaction summary
      const summary = await reactionApi.getReactionSummary(reactableType, reactableId);
      setReactionSummary(summary);
      
      // Notify parent component
      if (onReactionChange) {
        onReactionChange(summary);
      }
    } catch (err) {
      console.error('Error toggling reaction:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle quick reaction menu open
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle quick reaction menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Get the primary reaction type (the one with the most count)
  const getPrimaryReactionType = () => {
    const { countsByType } = reactionSummary;
    if (!countsByType || Object.keys(countsByType).length === 0) {
      return REACTION_TYPES.LIKE; // Default to like
    }
    
    let maxType = REACTION_TYPES.LIKE;
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(countsByType)) {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    }
    
    return maxType;
  };
  
  // Get button color based on reaction type
  const getButtonColor = (reactionType) => {
    return REACTION_COLORS[reactionType] || 'primary.main';
  };
  
  const primaryReactionType = getPrimaryReactionType();
  const userReactionType = userReaction?.reactionType;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Primary reaction button */}
      <Button
        size="small"
        startIcon={
          loading ? (
            <CircularProgress size={16} />
          ) : userReactionType ? (
            REACTION_ICONS[userReactionType]?.filled || REACTION_ICONS[REACTION_TYPES.LIKE].filled
          ) : (
            REACTION_ICONS[primaryReactionType]?.outlined || REACTION_ICONS[REACTION_TYPES.LIKE].outlined
          )
        }
        onClick={() => handleReactionClick(userReactionType || primaryReactionType)}
        disabled={loading || !isAuthenticated}
        sx={{ 
          mr: 1,
          color: userReactionType ? getButtonColor(userReactionType) : 'text.secondary',
          '&:hover': {
            backgroundColor: 'transparent'
          }
        }}
      >
        {userReactionType ? (
          // Show the user's reaction text
          userReactionType.charAt(0).toUpperCase() + userReactionType.slice(1)
        ) : (
          // Show primary reaction text
          primaryReactionType.charAt(0).toUpperCase() + primaryReactionType.slice(1)
        )}
        {' '}
        {!summaryLoading && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {reactionSummary.totalCount > 0 ? `(${reactionSummary.totalCount})` : ''}
          </Typography>
        )}
      </Button>
      
      {/* Quick reactions button */}
      {isAuthenticated && (
        <>
          <Tooltip title="More reactions">
            <IconButton
              size="small"
              onClick={handleClick}
              sx={{ 
                fontSize: '0.75rem',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              +
            </IconButton>
          </Tooltip>
          
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box sx={{ display: 'flex', p: 0.5 }}>
              {Object.values(REACTION_TYPES).map((type) => (
                <Tooltip key={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
                  <IconButton
                    onClick={() => handleReactionClick(type)}
                    size="small"
                    sx={{ 
                      color: getButtonColor(type),
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    {userReactionType === type ? 
                      REACTION_ICONS[type].filled : 
                      REACTION_ICONS[type].outlined}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Popover>
        </>
      )}
    </Box>
  );
};

export default ReactionButtons;
