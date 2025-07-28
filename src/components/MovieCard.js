import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  CardActions,
  IconButton,
  Tooltip,
  Rating,
  useTheme,
  Chip
} from '@mui/material';
import { useUser } from '../context/UserContext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import TheatersIcon from '@mui/icons-material/Theaters';
import StarIcon from '@mui/icons-material/Star';

const MovieCard = ({ movie }) => {
  const theme = useTheme();
  const { user, updateLikes, updateDislikes } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  
  if (!movie) return null;
  
  const { 
    id, 
    title, 
    poster_path, 
    release_date, 
    vote_average, 
    isLiked, 
    isDisliked 
  } = movie;

  const releaseYear = release_date ? new Date(release_date).getFullYear() : '';
  const rating = vote_average ? (vote_average / 2).toFixed(1) : 'N/A';
  
  const handleAction = (e) => {
    e.stopPropagation();
  };
  
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      updateLikes(id.toString(), isLiked);
    }
  };
  
  const handleDislike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      updateDislikes(id.toString(), isDisliked);
    }
  }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)',
          '& .movie-actions': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster with Overlay */}
      <Box sx={{ position: 'relative', paddingTop: '150%' }}>
        {/* Movie Poster */}
        <CardMedia
          component="img"
          image={poster_path 
            ? `https://image.tmdb.org/t/p/w500${poster_path}`
            : '/no-poster.jpg'}
          alt={title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.3s ease-in-out',
            filter: isHovered ? 'brightness(0.7)' : 'brightness(1)',
          }}
        />
        
        {/* Rating Badge */}
        <Chip
          icon={<StarIcon sx={{ color: 'gold' }} />}
          label={rating}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            fontWeight: 'bold',
          }}
        />
        
        {/* Hover Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            padding: 2,
            textAlign: 'center',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            size="large"
            fullWidth
            sx={{
              mb: 1,
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
            onClick={handleAction}
            component={Link}
            to={`/movie/${id}`}
          >
            Watch Movie
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<TheatersIcon />}
            size="large"
            fullWidth
            sx={{
              mb: 2,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
            onClick={handleAction}
          >
            Watch Trailer
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Tooltip title={user ? (isLiked ? 'Remove like' : 'Like') : 'Sign in to like'}>
              <IconButton 
                onClick={handleLike}
                color={isLiked ? 'primary' : 'default'}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <ThumbUpIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={user ? (isDisliked ? 'Remove dislike' : 'Dislike') : 'Sign in to dislike'}>
              <IconButton 
                onClick={handleDislike}
                color={isDisliked ? 'error' : 'default'}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <ThumbDownIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {/* Movie Info */}
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="subtitle1" 
          component="h3" 
          sx={{
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {rating}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {releaseYear || 'N/A'}
            </Typography>
          </Box>
          
          {/* Like/Dislike Buttons (Mobile) */}
          <CardActions sx={{ p: 0, justifyContent: 'space-between', display: { xs: 'flex', md: 'none' } }}>
            <Tooltip title={user ? (isLiked ? 'Remove like' : 'Like') : 'Sign in to like'}>
              <IconButton 
                onClick={handleLike}
                size="small"
                color={isLiked ? 'primary' : 'default'}
              >
                <ThumbUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={user ? (isDisliked ? 'Remove dislike' : 'Dislike') : 'Sign in to dislike'}>
              <IconButton 
                onClick={handleDislike}
                size="small"
                color={isDisliked ? 'error' : 'default'}
              >
                <ThumbDownIcon fontSize="small" />
          component={Link}
          to={`/movie/${id}`}
          sx={{ 
            mb: 1,
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default MovieCard;
