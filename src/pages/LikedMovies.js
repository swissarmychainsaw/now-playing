import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Button } from '@mui/material';
import { useUser } from '../context/UserContext';
import MovieCard from '../components/MovieCard';
import { getMovieDetails } from '../services/tmdb';

const LikedMovies = () => {
  const { user, likes = [] } = useUser();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedMovies = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setError('Please sign in to view your liked movies');
          setLoading(false);
          return;
        }

        if (likes.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }

        // Fetch details for each liked movie
        const moviePromises = likes.map(movieId => 
          getMovieDetails(movieId)
            .then(movie => ({
              ...movie,
              isLiked: true,
              isDisliked: false
            }))
            .catch(() => null) // Skip any failed requests
        );

        const movieResults = await Promise.all(moviePromises);
        setMovies(movieResults.filter(Boolean));
        
      } catch (err) {
        console.error('Error fetching liked movies:', err);
        setError('Failed to load liked movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedMovies();
  }, [user, likes]);

  if (!user) {
    return (
      <Box textAlign="center" my={8}>
        <Typography variant="h5" gutterBottom>
          Sign in to view your liked movies
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          href="/login"
          sx={{ mt: 2 }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" my={4}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Liked Movies
      </Typography>
      
      {movies.length === 0 ? (
        <Box textAlign="center" my={8}>
          <Typography variant="h6" color="text.secondary">
            You haven't liked any movies yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            href="/"
            sx={{ mt: 2 }}
          >
            Browse Movies
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {movies.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
              <MovieCard movie={movie} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default LikedMovies;
