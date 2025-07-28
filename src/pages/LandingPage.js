import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  IconButton
} from '@mui/material';
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';
import LikeDislikeButtons from '../components/LikeDislikeButtons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { useUser } from '../context/UserContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [oscarWinners, setOscarWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, likes, dislikes, updateLikes, updateDislikes } = useUser();
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLike = async (movieId) => {
    if (!user) return;
    try {
      await updateLikes(movieId);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDislike = async (movieId) => {
    if (!user) return;
    try {
      await updateDislikes(movieId);
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };

  const isMovieLiked = (movieId) => likes?.includes(movieId) || false;

  // Fetch random popular movies
  useEffect(() => {
    const fetchRandomPopularMovies = async () => {
      try {
        const randomPage = Math.floor(Math.random() * 20) + 1; // Random page between 1 and 20
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: {
            api_key: process.env.REACT_APP_TMDB_API_KEY,
            sort_by: 'popularity.desc',
            page: randomPage,
            include_adult: false,
            language: 'en-US'
          },
        });
        setOscarWinners(response.data.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRandomPopularMovies();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message || 'An error occurred during sign-in');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: {
            api_key: process.env.REACT_APP_TMDB_API_KEY,
            sort_by: 'popularity.desc',
            page: Math.floor(Math.random() * 10) + 1
          }
        });
        
        if (response.data.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.data.results.length);
          const randomMovie = response.data.results[randomIndex];
          navigate(`/movie/${randomMovie.id}`);
        } else {
          setError('No movies found');
        }
      } catch (error) {
        console.error('Error fetching random movie:', error);
        setError('Error fetching random movie');
      }
      return;
    }
    try {
      const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: process.env.REACT_APP_TMDB_API_KEY,
          query: searchTerm
        }
      });
      if (response.data.results.length > 0) {
        const movie = response.data.results[0];
        navigate(`/movie/${movie.id}`);
      } else {
        setError('No movies found');
      }
    } catch (err) {
      console.error('Error searching for movie:', err);
      setError('Error searching for movie');
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      gap: 4,
      mt: 4 
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
      }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          What's your favorite movie?
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
      >
        {user && (
          <Typography variant="body1" sx={{ color: 'white' }}>
            {user.displayName || user.email}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ color: 'white' }}>
            Likes: {likes}
          </Typography>
          <Typography variant="body1" sx={{ color: 'white' }}>
            Dislikes: {dislikes}
          </Typography>
        </Box>
        <Button 
          color="inherit" 
          onClick={() => window.location.href = '/'}
          sx={{
            color: 'white',
            textTransform: 'none',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '4px'
          }}
        >
          Start Over
        </Button>
      </Box>
      <Box component="form" onSubmit={handleSearch} sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        maxWidth: 600,
        width: '100%'
      }}>
        <TextField
          fullWidth
          label="Search for a movie"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Search
          </Button>
          {!user && (
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleGoogleSignIn}
              sx={{
                backgroundColor: '#4285F4',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#357ABE'
                }
              }}
            >
              Sign in with Google
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        Or browse Oscar-winning movies:
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {oscarWinners.map((movie) => (
            <Grid item xs={12} sm={6} md={6} key={movie.id}>
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
                    objectFit: 'cover'
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
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      Your preferences help us recommend movies you'll love!
                    </Typography>
                    <LikeDislikeButtons
                      movieId={movie.id}
                      isLiked={isMovieLiked(movie.id)}
                      onLike={handleLike}
                      onDislike={handleDislike}
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default LandingPage;
