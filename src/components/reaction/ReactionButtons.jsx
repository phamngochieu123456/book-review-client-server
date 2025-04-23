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
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Paper
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import MoodBadOutlinedIcon from '@mui/icons-material/MoodBadOutlined';
import { useAuth } from '../../context/AuthContext';
import { reactionApi } from '../../api/reviewCommentApi';

// Available reaction types
const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry'
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
  },
  [REACTION_TYPES.ANGRY]: {
    filled: <MoodBadIcon fontSize="small" />,
    outlined: <MoodBadOutlinedIcon fontSize="small" />
  }
};

// Colors for each reaction type
const REACTION_COLORS = {
  [REACTION_TYPES.LIKE]: 'primary.main',
  [REACTION_TYPES.LOVE]: '#e91e63', // pink
  [REACTION_TYPES.HAPPY]: '#ffc107', // amber
  [REACTION_TYPES.SAD]: '#9e9e9e', // grey
  [REACTION_TYPES.ANGRY]: '#f44336' // red
};

// Human-readable labels for each reaction type
const REACTION_LABELS = {
  [REACTION_TYPES.LIKE]: 'Like',
  [REACTION_TYPES.LOVE]: 'Love',
  [REACTION_TYPES.HAPPY]: 'Happy',
  [REACTION_TYPES.SAD]: 'Sad',
  [REACTION_TYPES.ANGRY]: 'Angry'
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
  
  // Reaction breakdown tooltip/popover state
  const [countAnchorEl, setCountAnchorEl] = useState(null);
  const isCountPopoverOpen = Boolean(countAnchorEl);
  
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
  
  // Handle opening reaction count breakdown popover
  const handleCountClick = (event) => {
    // Only show popover if there are reactions
    if (reactionSummary.totalCount > 0) {
      setCountAnchorEl(event.currentTarget);
    }
  };
  
  // Handle closing reaction count breakdown popover
  const handleCountClose = () => {
    setCountAnchorEl(null);
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
  
  // Generate reaction counts display for the popover
  const getReactionCounts = () => {
    const { countsByType } = reactionSummary;
    if (!countsByType) return [];
    
    // Sort reaction types by count (descending)
    return Object.entries(countsByType)
      .filter(([_, count]) => count > 0) // Only include reactions with counts > 0
      .sort(([_, countA], [__, countB]) => countB - countA) // Sort by count descending
      .map(([type, count]) => ({
        type,
        count,
        label: REACTION_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1)
      }));
  };
  
  const primaryReactionType = getPrimaryReactionType();
  const userReactionType = userReaction?.reactionType;
  const reactionCounts = getReactionCounts();
  
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
        
        {/* Reaction count that triggers popover on click */}
        {!summaryLoading && reactionSummary.totalCount > 0 && (
          <Typography 
            component="span" 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              ml: 0.5,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent button
              handleCountClick(e);
            }}
          >
            ({reactionSummary.totalCount})
          </Typography>
        )}
      </Button>
      
      {/* Reaction counts breakdown popover */}
      <Popover
        open={isCountPopoverOpen}
        anchorEl={countAnchorEl}
        onClose={handleCountClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 1, maxWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ p: 1 }}>
            Reaction Breakdown
          </Typography>
          <Divider />
          <List dense>
            {reactionCounts.map(({ type, count, label }) => (
              <ListItem key={type}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: getButtonColor(type),
                        mr: 1
                      }}
                    >
                      {REACTION_ICONS[type]?.filled || REACTION_ICONS[REACTION_TYPES.LIKE].filled}
                    </Avatar>
                    <Typography variant="body2">{label}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {count}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popover>
      
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
                <Tooltip key={type} title={REACTION_LABELS[type]}>
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
