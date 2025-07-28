import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Rating,
  Chip
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';

const MovieCard = ({ 
  movie, 
  isLiked = false, 
  isDisliked = false,
  onLike, 
  onDislike,
  showActions = true,
  showOverview = true,
  showRating = true,
  onClick
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = (e) => {
    // Don't navigate if clicking on like/dislike buttons
    if (e.target.closest('button')) return;
    if (onClick) {
      onClick(movie);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) onLike(movie.id);
  };

  const handleDislikeClick = (e) => {
    e.stopPropagation();
    if (onDislike) onDislike(movie.id);
  };

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 3,
          '& .play-button': {
            opacity: 1,
          }
        },
        position: 'relative',
        overflow: 'visible',
      }}
      elevation={2}
    >
      <CardActionArea 
        onClick={handleCardClick}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          <CardMedia
            component="img"
            sx={{
              width: '100%',
              aspectRatio: '2/3',
              objectFit: 'cover',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}
            image={posterUrl}
            alt={movie.title}
          />
          <Box 
            className="play-button"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              },
            }}
          >
            <PlayArrowIcon sx={{ color: 'white', fontSize: 40 }} />
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, width: '100%', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" component="h3" noWrap sx={{ fontWeight: 600, maxWidth: 'calc(100% - 50px)' }}>
              {movie.title}
            </Typography>
            {releaseYear && (
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                ({releaseYear})
              </Typography>
            )}
          </Box>
          
          {showRating && movie.vote_average > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating 
                value={movie.vote_average / 2} 
                precision={0.5} 
                readOnly 
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {movie.vote_average.toFixed(1)}/10
              </Typography>
            </Box>
          )}
          
          {movie.genres && movie.genres.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              {movie.genres.slice(0, 3).map((genre) => (
                <Chip 
                  key={genre.id} 
                  label={genre.name} 
                  size="small" 
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              ))}
            </Box>
          )}
          
          {showOverview && movie.overview && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 1.5
              }}
            >
              {movie.overview}
            </Typography>
          )}
          
          {showActions && (onLike || onDislike) && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 1, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Tooltip title={isLiked ? 'Remove like' : 'Like'}>
                <IconButton 
                  onClick={handleLike}
                  size="small"
                  sx={{
                    color: isLiked ? 'primary.main' : 'inherit',
                    '&:hover': {
                      backgroundColor: isLiked ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isDisliked ? 'Remove dislike' : 'Dislike'}>
                <IconButton 
                  onClick={handleDislikeClick}
                  size="small"
                  sx={{
                    color: isDisliked ? 'error.main' : 'inherit',
                    '&:hover': {
                      backgroundColor: isDisliked ? 'rgba(211, 47, 47, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MovieCard;
