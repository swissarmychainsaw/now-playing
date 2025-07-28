import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';

const MovieCard = ({ movie, isLiked, onUnlike, onDislike }) => {
  const handleUnlike = () => {
    if (onUnlike) onUnlike(movie.id);
  };

  const handleDislike = () => {
    if (onDislike) onDislike(movie.id);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: 200,
          objectFit: 'cover',
          borderRadius: '8px'
        }}
        image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {movie.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {new Date(movie.release_date).getFullYear()}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {movie.overview}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={handleUnlike}
            disabled={!isLiked}
            sx={{
              '&:hover': {
                backgroundColor: isLiked ? 'primary.main' : 'transparent'
              }
            }}
          >
            <ThumbUpIcon sx={{ color: isLiked ? 'primary.main' : 'inherit' }} />
          </IconButton>
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
        </Box>
      </Box>
    </Card>
  );
};

export default MovieCard;
