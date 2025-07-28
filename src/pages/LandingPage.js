import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Container
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { useUser } from '../context/UserContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import MovieCard from '../components/MovieCard';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [popularMovies, setPopularMovies] = useState([]);
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

  // Fetch movies based on user's liked movies
  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      try {
        if (!likes || likes.length === 0) {
          // If no likes, show popular movies
          const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
              api_key: process.env.REACT_APP_TMDB_API_KEY,
              sort_by: 'popularity.desc',
              page: Math.floor(Math.random() * 10) + 1,
              include_adult: false,
              language: 'en-US'
            }
          });
          setPopularMovies(response.data.results);
          return;
        }

        // Get movie details for liked movies to extract genres
        const likedMovies = await Promise.all(
          likes.map(async (movieId) => {
            try {
              const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                params: {
                  api_key: process.env.REACT_APP_TMDB_API_KEY
                }
              });
              return response.data;
            } catch (error) {
              console.error(`Error fetching movie ${movieId}:`, error);
              return null;
            }
          })
        );

        // Get all genres from liked movies
        const allGenres = new Set();
        likedMovies.forEach(movie => {
          if (movie && movie.genres) {
            movie.genres.forEach(genre => allGenres.add(genre.id));
          }
        });

        // Get recommendations based on genres
        const recommendations = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: {
            api_key: process.env.REACT_APP_TMDB_API_KEY,
            with_genres: Array.from(allGenres).join('|'),
            sort_by: 'popularity.desc',
            page: Math.floor(Math.random() * 10) + 1,
            include_adult: false,
            language: 'en-US'
          }
        });

        setPopularMovies(recommendations.data.results);
      } catch (error) {
        console.error('Error fetching recommended movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendedMovies();
  }, [likes]);

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
    try {
      if (searchTerm.trim()) {
        // If search term exists, search for that movie
        const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
          params: {
            api_key: process.env.REACT_APP_TMDB_API_KEY,
            query: searchTerm,
            include_adult: false
          }
        });
        
        if (response.data.results.length > 0) {
          const firstResult = response.data.results[0];
          navigate(`/movie/${firstResult.id}`);
        } else {
          setError('No movies found for that search term.');
        }
      } else {
        // If no search term, show random popular movie
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
          setError('No movies found. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Error searching movies. Please try again.');
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
         // Pick a movie you like and we'll find more like it.
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
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {popularMovies.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <MovieCard
                  movie={{
                    ...movie,
                    // Ensure genres is an array
                    genres: movie.genre_ids ? movie.genre_ids.map(id => ({ id, name: getGenreName(id) })) : []
                  }}
                  isLiked={isMovieLiked(movie.id)}
                  isDisliked={isMovieDisliked(movie.id)}
                  onLike={() => handleLike(movie.id)}
                  onDislike={() => handleDislike(movie.id)}
                  showActions={!!user}
                  showOverview={false}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default LandingPage;
