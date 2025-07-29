import React, { useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import { searchMovies } from '../services/tmdb';
import { 
  getForYouRecommendations,
  getOscarWinners,
  getCriticsPicks,
  getPersonalizedRecommendations
} from '../services/recommendations';
import MovieCard from '../components/MovieCard';

const CATEGORIES = [
  { id: 'forYou', label: 'For You', fetchFn: getForYouRecommendations },
  { id: 'oscarWinners', label: 'Oscar Winners', fetchFn: getOscarWinners },
  { id: 'popular', label: 'Popular', fetchFn: getPersonalizedRecommendations },
  { id: 'criticsPicks', label: "Critics' Picks", fetchFn: getCriticsPicks },
];

const LoginPage = () => {
  const { signInWithGoogle, loading, error } = useUser();
  const navigate = useNavigate();

  // Handle click anywhere on the page
  const handlePageClick = useCallback(async (e) => {
    // Don't trigger login if clicking on the header
    if (e.target.closest('header, .MuiAppBar-root')) {
      return;
    }
    
    if (!loading) {
      try {
        await signInWithGoogle();
        navigate('/');
      } catch (err) {
        console.error('Error signing in with Google:', err);
      }
    }
  }, [signInWithGoogle, navigate, loading]);

  // Add click handler to the entire page
  useEffect(() => {
    document.body.style.cursor = 'pointer';
    document.addEventListener('click', handlePageClick);
    
    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('click', handlePageClick);
    };
  }, [handlePageClick]);

  // Load sample movies for display (same as landing page)
  const [movies, setMovies] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadSampleMovies = async () => {
      try {
        // Load popular movies for the login page
        const data = await getPersonalizedRecommendations();
        setMovies(Array.isArray(data) ? data.slice(0, 12) : (data?.results?.slice(0, 12) || []));
      } catch (err) {
        console.error('Error loading sample movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSampleMovies();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      {/* Overlay with sign-in message */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={handlePageClick}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 4,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          <Typography variant="h4" component="h1" color="white" gutterBottom>
            Welcome to Now Playing
          </Typography>
          <Typography variant="h6" color="white" paragraph>
            Click anywhere to sign in with Google
          </Typography>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Landing page content (blurred and non-interactive) */}
      <Box sx={{ filter: 'blur(5px)', pointerEvents: 'none' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Search Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              What would you like to watch?
            </Typography>
          </Box>

          {/* Movie Grid */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h3">
                Popular on Now Playing
              </Typography>
            </Box>
            
            {isLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(6, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {movies.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    isPreview={true}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LoginPage;
