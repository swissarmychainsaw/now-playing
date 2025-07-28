import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  CardActionArea,
  IconButton,
  Tooltip,
  Rating,
  useTheme
} from '@mui/material';
import { useUser } from '../context/UserContext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const MovieCard = ({ movie }) => {
  const theme = useTheme();
  const { user, updateLikes, updateDislikes } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  
  if (!movie) return null;
  
  const { id, title, poster_path, release_date, vote_average, isLiked, isDisliked } = movie;
  
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      updateLikes(id.toString(), isLiked);
    } else {
      // Optionally show login prompt
      console.log('Please log in to like movies');
    }
  };
  
  const handleDislike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      updateDislikes(id.toString(), isDisliked);
    } else {
      // Optionally show login prompt
      console.log('Please log in to dislike movies');
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
      <CardActionArea 
        component={Link} 
        to={`/movie/${id}`} 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', pt: '150%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/placeholder-movie.jpg'}
            alt={title}
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          
          {/* Rating Badge */}
          <Box 
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: 'white',
              borderRadius: '4px',
              px: 1,
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ThumbUpIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="body2" fontWeight="bold">
              {vote_average ? vote_average.toFixed(1) : 'N/A'}
            </Typography>
          </Box>
          
          {/* Like/Dislike Buttons */}
          <Box 
            className="movie-actions"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 1,
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              transform: 'translateY(100%)',
              opacity: 0,
              transition: 'all 0.3s ease',
            }}
          >
            <Tooltip title={isLiked ? 'Remove like' : 'Like'} arrow>
              <IconButton 
                size="small" 
                onClick={handleLike}
                sx={{ 
                  color: isLiked ? theme.palette.primary.main : 'white',
                  backgroundColor: isLiked ? 'rgba(25, 118, 210, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: isLiked ? 'rgba(25, 118, 210, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <ThumbUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isDisliked ? 'Remove dislike' : 'Dislike'} arrow>
              <IconButton 
                size="small" 
                onClick={handleDislike}
                sx={{ 
                  color: isDisliked ? theme.palette.error.main : 'white',
                  backgroundColor: isDisliked ? 'rgba(211, 47, 47, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: isDisliked ? 'rgba(211, 47, 47, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <ThumbDownIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2, width: '100%' }}>
          <Typography 
            variant="subtitle1" 
            component="h3" 
            noWrap 
            sx={{ 
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.8rem',
                opacity: 0.8,
              }}
            >
              {release_date?.substring(0, 4) || 'N/A'}
            </Typography>
            
            <Box display="flex" alignItems="center">
              {isLiked ? (
                <FavoriteIcon color="primary" fontSize="small" sx={{ ml: 0.5 }} />
              ) : isDisliked ? (
                <FavoriteBorderIcon color="disabled" fontSize="small" sx={{ ml: 0.5 }} />
              ) : null}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      <Box p={2} pt={0} sx={{ mt: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          startIcon={<PlayArrowIcon />}
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
