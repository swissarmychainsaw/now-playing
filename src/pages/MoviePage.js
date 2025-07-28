import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  Chip,
  IconButton,
  Rating,
  Divider
} from '@mui/material';
import { ArrowBack, PlayArrow, Favorite, FavoriteBorder, ThumbUp, ThumbDown } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { getMovieDetails } from '../services/tmdb';

const MoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateLikes, updateDislikes } = useUser();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const data = await getMovieDetails(id);
        setMovie(data);
        
        // Check if movie is in user's liked/disliked lists
        if (user) {
          setIsLiked(user.likes?.includes(id));
          setIsDisliked(user.dislikes?.includes(id));
        }
        
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id, user]);

  const handleLike = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // If user is unliking, no need to remove from dislikes
    if (newLikedState && isDisliked) {
      setIsDisliked(false);
      updateDislikes(id, true); // Remove from dislikes
    }
    
    updateLikes(id, !newLikedState);
  };

  const handleDislike = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const newDislikedState = !isDisliked;
    setIsDisliked(newDislikedState);
    
    // If user is undisliking, no need to remove from likes
    if (newDislikedState && isLiked) {
      setIsLiked(false);
      updateLikes(id, true); // Remove from likes
    }
    
    updateDislikes(id, !newDislikedState);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Movie not found'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  const {
    title,
    overview,
    poster_path,
    backdrop_path,
    release_date,
    runtime,
    vote_average,
    genres = [],
    credits = {},
  } = movie;

  const releaseYear = new Date(release_date).getFullYear();
  const director = credits.crew?.find(person => person.job === 'Director')?.name || 'N/A';
  const cast = credits.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';

  return (
    <Box>
      {/* Backdrop Image */}
      <Box 
        sx={{
          height: '40vh',
          minHeight: 300,
          backgroundImage: `url(https://image.tmdb.org/t/p/original${backdrop_path || poster_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', pt: 4 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)}
            sx={{ color: 'white', mb: 2 }}
          >
            Back
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
        <Paper elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Grid container spacing={0}>
            {/* Poster */}
            <Grid item xs={12} md={4} lg={3}>
              <Box 
                component="img"
                src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                alt={title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Grid>

            {/* Movie Details */}
            <Grid item xs={12} md={8} lg={9} sx={{ p: 4 }}>
              <Box display="flex" flexDirection="column" height="100%">
                <Box flexGrow={1}>
                  <Typography variant="h3" component="h1" gutterBottom>
                    {title} {releaseYear ? `(${releaseYear})` : ''}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                    <Rating value={vote_average / 2} precision={0.1} readOnly />
                    <Typography variant="body2" color="text.secondary" ml={1}>
                      {vote_average?.toFixed(1)}/10
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mx={1}>•</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {runtime} min
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mx={1}>•</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {release_date}
                    </Typography>
                  </Box>

                  <Box mb={3} display="flex" flexWrap="wrap" gap={1}>
                    {genres.map(genre => (
                      <Chip 
                        key={genre.id} 
                        label={genre.name} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Typography variant="body1" paragraph>
                    {overview || 'No overview available.'}
                  </Typography>

                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Director: <Typography component="span" color="text.primary">{director}</Typography>
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cast: <Typography component="span" color="text.primary">{cast}</Typography>
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={2} mt={3} flexWrap="wrap">
                  <Button 
                    variant="contained" 
                    size="large" 
                    startIcon={<PlayArrow />}
                    sx={{ borderRadius: 2, minWidth: 180 }}
                  >
                    Watch Now
                  </Button>
                  
                  <IconButton 
                    color={isLiked ? 'primary' : 'default'}
                    onClick={handleLike}
                    title={isLiked ? 'Remove from liked' : 'Like this movie'}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ThumbUp />
                  </IconButton>
                  
                  <IconButton 
                    color={isDisliked ? 'error' : 'default'}
                    onClick={handleDislike}
                    title={isDisliked ? 'Remove dislike' : 'Dislike this movie'}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ThumbDown />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default MoviePage;
