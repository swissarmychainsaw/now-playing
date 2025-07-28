import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import MovieCard from '../components/MovieCard';

const LikedMovies = () => {
  const [tab, setTab] = useState(0);
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { likes, dislikes, updateLikes, updateDislikes } = useUser();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch liked movies
        const likedMovieIds = Array.isArray(likes) ? likes : [];
        const dislikedMovieIds = Array.isArray(dislikes) ? dislikes : [];

        // Fetch liked movies
        if (likedMovieIds.length > 0) {
          const likedPromises = likedMovieIds.map(id => 
            axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
              params: {
                api_key: process.env.REACT_APP_TMDB_API_KEY
              }
            })
          );
          const likedResponses = await Promise.all(likedPromises);
          const likedMovies = likedResponses.map(response => response.data);
          setLikedMovies(likedMovies);
        } else {
          setLikedMovies([]);
        }

        // Fetch disliked movies
        if (dislikedMovieIds.length > 0) {
          const dislikedPromises = dislikedMovieIds.map(id => 
            axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
              params: {
                api_key: process.env.REACT_APP_TMDB_API_KEY
              }
            })
          );
          const dislikedResponses = await Promise.all(dislikedPromises);
          const dislikedMovies = dislikedResponses.map(response => response.data);
          setDislikedMovies(dislikedMovies);
        } else {
          setDislikedMovies([]);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Error fetching movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [likes, dislikes]);

  const handleDislike = async (movieId) => {
    try {
      await updateDislikes(movieId);
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (likes.length === 0 && dislikes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h5">No liked or disliked movies yet</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Start liking or disliking movies on the landing page to see them here!
        </Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Your Movie Preferences
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Liked Movies" />
          <Tab label="Disliked Movies" />
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        {tab === 0 ? (
          <>
            {likedMovies.length === 0 ? (
              <Typography variant="h5" sx={{ textAlign: 'center', mt: 4 }}>
                No liked movies yet
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {likedMovies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} key={movie.id}>
                    <MovieCard
                      movie={movie}
                      isLiked={true}
                      onUnlike={updateDislikes}
                      onDislike={updateDislikes}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        ) : (
          <>
            {dislikedMovies.length === 0 ? (
              <Typography variant="h5" sx={{ textAlign: 'center', mt: 4 }}>
                No disliked movies yet
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {dislikedMovies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} key={movie.id}>
                    <MovieCard
                      movie={movie}
                      isLiked={false}
                      onUnlike={updateLikes}
                      onDislike={updateLikes}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default LikedMovies;
