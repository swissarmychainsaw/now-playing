import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';

const LikeDislikeButtons = ({ movieId, isLiked, onLike, onDislike }) => {
  const handleLike = async () => {
    if (onLike) await onLike(movieId);
  };

  const handleDislike = async () => {
    if (onDislike) await onDislike(movieId);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
        <IconButton 
          onClick={handleLike}
          sx={{
            '&:hover': {
              backgroundColor: isLiked ? 'primary.main' : 'rgba(25, 118, 210, 0.1)'
            }
          }}
        >
          <ThumbUpIcon sx={{ color: isLiked ? 'primary.main' : 'inherit' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={isLiked ? 'Dislike' : 'Remove Dislike'}>
        <IconButton 
          onClick={handleDislike}
          disabled={isLiked}
          sx={{
            '&:hover': {
              backgroundColor: !isLiked ? 'error.main' : 'transparent'
            }
          }}
        >
          <ThumbDownIcon sx={{ color: !isLiked ? 'error.main' : 'inherit' }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default LikeDislikeButtons;
