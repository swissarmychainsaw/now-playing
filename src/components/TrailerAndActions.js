import React from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Theaters as TheatersIcon } from '@mui/icons-material';
import LikeDislikeButtons from './LikeDislikeButtons';

const TrailerAndActions = ({ movie, streamingInfo, onLike, onDislike, isLiked, isDisliked }) => {
  const getButtonText = () => {
    if (!streamingInfo) return 'Check Availability';
    return (
      <Box sx={{ textAlign: 'left' }}>
        <Box>{streamingInfo.type}</Box>
        <Box sx={{ fontSize: '0.8em', opacity: 0.8 }}>{streamingInfo.provider}</Box>
      </Box>
    );
  };

  const getTrailerUrl = () => {
    return `https://www.themoviedb.org/movie/${movie.id}/videos`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {streamingInfo ? (
          <Tooltip title={`Watch on ${streamingInfo.provider}`}>
            <Button
              startIcon={<PlayArrowIcon />}
              variant="contained"
              size="large"
              color="primary"
              sx={{ 
                textTransform: 'none', 
                minWidth: 180,
                height: 54,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
              href={streamingInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${streamingInfo.type} ${streamingInfo.provider}`}
            >
              {getButtonText()}
            </Button>
          </Tooltip>
        ) : (
          <Button
            startIcon={<PlayArrowIcon />}
            variant="outlined"
            size="large"
            sx={{ textTransform: 'none', minWidth: 180, height: 54 }}
            href={`https://www.themoviedb.org/movie/${movie.id}/watch`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Check streaming availability"
          >
            Check Availability
          </Button>
        )}
        
        <Button
          startIcon={<TheatersIcon />}
          variant="outlined"
          size="large"
          sx={{ textTransform: 'none', minWidth: 150, height: 54 }}
          href={getTrailerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch trailer"
        >
          Trailer
        </Button>

        <LikeDislikeButtons
          movieId={movie.id}
          isLiked={isLiked}
          isDisliked={isDisliked}
          onLike={onLike}
          onDislike={onDislike}
        />
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        {streamingInfo 
          ? `Available on ${streamingInfo.provider}` 
          : 'Check TMDb for streaming options'}
      </Typography>
      
      <Typography variant="caption" color="text.secondary">
        Rate movies to get better recommendations!
      </Typography>
    </Box>
  );
};

export default TrailerAndActions;
