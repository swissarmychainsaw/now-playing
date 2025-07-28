import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
  Paper,
  Grid,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MovieIcon from '@mui/icons-material/Movie';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import MovieCard from '../components/MovieCard';
import axios from 'axios';

// Recommendation types
const RECOMMENDATION_TYPES = {
  FOR_YOU: 'for_you',
  OSCAR: 'oscar',
  POPULAR: 'popular',
  CRITICS: 'critics'
};

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendationType, setRecommendationType] = useState(RECOMMENDATION_TYPES.FOR_YOU);
  const { user, likes } = useUser();
  const navigate = useNavigate();

  // Fetch movies based on recommendation type
  const fetchMovies = useCallback(async (type = RECOMMENDATION_TYPES.FOR_YOU) => {
    console.log('fetchMovies called with type:', type);
    if (loading) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    setLoading(true);
    setError('');
    setMovies([]);

    try {
      const apiKey = process.env.REACT_APP_TMDB_API_KEY;
      if (!apiKey) {
        throw new Error('TMDb API key is not configured. Please check your .env file.');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetching movies of type: ${type}`);
      }

      let url = '';
      let params = {
        api_key: apiKey,
        language: 'en-US',
        include_adult: false,
        page: 1
      };

      // Handle 'For You' recommendations
      if (type === RECOMMENDATION_TYPES.FOR_YOU) {
        if (!likes || likes.length === 0) {
          console.log('No liked movies to base recommendations on');
          setMovies([]);
          setLoading(false);
          return;
        }

        // Fetch details for first 5 liked movies
        const requests = likes.slice(0, 5).map((id) =>
          axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
            params: { 
              api_key: apiKey,
              append_to_response: 'videos,credits,release_dates',
              language: 'en-US'
            },
            timeout: 10000
          })
        );

        const responses = await Promise.allSettled(requests);
        const successful = responses
          .filter((res) => res.status === 'fulfilled' && res.value?.data)
          .map((res) => res.value.data);

        setMovies(successful);
        setRecommendationType(type);
        setLoading(false);
        return;
      }

      // Configure API parameters based on recommendation type
      switch (type) {
        case RECOMMENDATION_TYPES.OSCAR:
          url = 'https://api.themoviedb.org/3/discover/movie';
          params = {
            ...params,
            sort_by: 'vote_average.desc',
            'vote_average.gte': 7.5,
            'vote_count.gte': 1000,
            with_original_language: 'en',
            'primary_release_date.gte': '2000-01-01',
            with_watch_providers: '8',
            watch_region: 'US'
          };
          break;
          
        case RECOMMENDATION_TYPES.POPULAR:
          url = 'https://api.themoviedb.org/3/movie/popular';
          params = {
            ...params,
            sort_by: 'popularity.desc',
            'vote_average.gte': 6,
            'vote_count.gte': 50
          };
          break;
          
        case RECOMMENDATION_TYPES.CRITICS:
          url = 'https://api.themoviedb.org/3/movie/top_rated';
          params = {
            ...params,
            'vote_count.gte': 100,
            'primary_release_date.gte': '2015-01-01'
          };
          break;
          
        default:
          console.warn(`Unknown recommendation type: ${type}`);
          setLoading(false);
          return;
      }

      // Fetch movies from TMDb
      console.log('Fetching movies from:', url);
      console.log('With params:', { ...params, api_key: '***' });
      console.log('Full URL:', `${url}?${new URLSearchParams(params).toString().replace(/api_key=[^&]+/, 'api_key=***')}`);
      
      const response = await axios.get(url, { 
        params,
        timeout: 10000
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', {
          status: response.status,
          resultsCount: response.data?.results?.length || 0,
          totalPages: response.data?.total_pages,
          totalResults: response.data?.total_results
        });
      }
      
      if (!response.data || !Array.isArray(response.data.results)) {
        throw new Error('Invalid response from TMDb API: No results array');
      }
      
      // Filter out already liked movies and limit to 5
      const newMovies = response.data.results
        .filter(movie => movie && movie.id && !likes?.includes(movie.id))
        .slice(0, 5);
      
      // If no movies after filtering, show some results anyway
      const finalMovies = newMovies.length > 0 
        ? newMovies 
        : response.data.results.slice(0, 5);
      
      setMovies(finalMovies);
      setRecommendationType(type);
      
    } catch (error) {
      console.error('Error in fetchMovies:', error);
      setError('Failed to load movies. Please try again later.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [likes, loading]);

  // Load initial recommendations
  useEffect(() => {
    console.log('useEffect triggered, user:', user?.uid ? 'logged in' : 'not logged in');
    
    if (!user?.uid) {
      console.log('User not logged in, skipping fetch');
      setLoading(false); // Make sure loading is false when not fetching
      return;
    }
    
    // Set a flag to prevent state updates if component unmounts
    let isMounted = true;
    
    const loadInitialData = async () => {
      console.log('Starting loadInitialData');
      try {
        console.log('Fetching initial recommendations...');
        
        // Remove debounce temporarily for debugging
        try {
          console.log('Calling fetchMovies...');
          await fetchMovies(RECOMMENDATION_TYPES.FOR_YOU);
          console.log('fetchMovies completed');
        } catch (err) {
          console.error('Error in fetchMovies:', err);
          if (isMounted) {
            setError('Failed to load recommendations. ' + (err.message || 'Please try again.'));
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Unexpected error in loadInitialData:', err);
        if (isMounted) {
          setError('An unexpected error occurred. Please try refreshing the page.');
          setLoading(false);
        }
      } finally {
        console.log('loadInitialData completed, loading should be false');
      }
    };
    
    loadInitialData();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up...');
      isMounted = false;
    };
  }, [user?.uid, fetchMovies]); // Add fetchMovies to dependencies
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movie/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  // Handle recommendation type change
  const handleRecommendationType = (type) => {
    console.log('Recommendation type changed to:', type, 'current type:', recommendationType);
    if (type && type !== recommendationType) {
      setRecommendationType(type);
    }
  };

  // Get recommendation section title
  const getRecommendationTitle = () => {
    switch (recommendationType) {
      case RECOMMENDATION_TYPES.OSCAR:
        return 'Oscar-Winning Movies You Might Enjoy';
      case RECOMMENDATION_TYPES.POPULAR:
        return 'Popular Movies Just For You';
      case RECOMMENDATION_TYPES.CRITICS:
        return 'Critically Acclaimed Films';
      default:
        return 'Recommended For You';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Discover Your Next Favorite Movie
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for a movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2, 
                bgcolor: 'background.paper',
                mb: 2
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'medium'
            }}
          >
            Search
          </Button>
        </Box>
        
        {/* Recommendation Type Buttons */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', mb: 1 }}>
            Or browse by category:
          </Typography>
          <ButtonGroup
            fullWidth
            variant="outlined"
            aria-label="recommendation type"
            sx={{
              '& .MuiButtonGroup-grouped': {
                textTransform: 'none',
                fontWeight: 500,
                py: 1.5,
                '&:not(:last-of-type)': {
                  borderRight: 'none',
                },
              },
            }}
          >
            <Button 
              startIcon={<ThumbUpIcon />}
              variant={recommendationType === RECOMMENDATION_TYPES.FOR_YOU ? 'contained' : 'outlined'}
              onClick={() => handleRecommendationType(RECOMMENDATION_TYPES.FOR_YOU)}
            >
              For You
            </Button>
            <Button 
              startIcon={<EmojiEventsIcon />}
              variant={recommendationType === RECOMMENDATION_TYPES.OSCAR ? 'contained' : 'outlined'}
              onClick={() => handleRecommendationType(RECOMMENDATION_TYPES.OSCAR)}
            >
              Oscar Winners
            </Button>
            <Button 
              startIcon={<WhatshotIcon />}
              variant={recommendationType === RECOMMENDATION_TYPES.POPULAR ? 'contained' : 'outlined'}
              onClick={() => handleRecommendationType(RECOMMENDATION_TYPES.POPULAR)}
            >
              Popular
            </Button>
            <Button 
              startIcon={<MovieIcon />}
              variant={recommendationType === RECOMMENDATION_TYPES.CRITICS ? 'contained' : 'outlined'}
              onClick={() => handleRecommendationType(RECOMMENDATION_TYPES.CRITICS)}
            >
              Critics' Picks
            </Button>
          </ButtonGroup>
        </Box>
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Paper>
      
      {/* Movies Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
          {getRecommendationTitle()}
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : movies.length > 0 ? (
          <Grid container spacing={3}>
            {movies.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <MovieCard
                  movie={{
                    ...movie,
                    genres: movie.genre_ids?.map(id => ({
                      id,
                      name: getGenreName(id)
                    })) || []
                  }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No recommendations found. Try a different category or check back later.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

// Helper function to get genre name by ID
const getGenreName = (genreId) => {
  const genres = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };
  return genres[genreId] || 'Unknown';
};

export default LandingPage;
