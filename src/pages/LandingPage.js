import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, CircularProgress, Grid, Tabs, Tab, Button } from '@mui/material';
import { useUser } from '../context/UserContext';
import MovieCard from '../components/MovieCard';
import SearchSection from '../components/landing/SearchSection';
import { searchMovies } from '../services/tmdb';
import { 
  getForYouRecommendations,
  getOscarWinners,
  getCriticsPicks,
  getPersonalizedRecommendations
} from '../services/recommendations';

const CATEGORIES = [
  { id: 'forYou', label: 'For You', fetchFn: getForYouRecommendations },
  { id: 'oscarWinners', label: 'Oscar Winners', fetchFn: getOscarWinners },
  { id: 'popular', label: 'Popular', fetchFn: getPersonalizedRecommendations },
  { id: 'criticsPicks', label: "Critics' Picks", fetchFn: getCriticsPicks },
];

const LandingPage = () => {
  const { user, likes, dislikes } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchMovies = useCallback(async (fetchFn) => {
    setIsLoading(true);
    setError(null);
    try {
      // For the 'For You' tab, we need to pass the user's liked and disliked movies
      if (fetchFn === getForYouRecommendations) {
        const data = await fetchFn(
          user ? likes || [] : [],
          user ? dislikes || [] : []
        );
        setMovies(Array.isArray(data) ? data : (data?.results || []));
      } 
      // For other tabs, just call the function directly
      else {
        const data = await fetchFn();
        setMovies(Array.isArray(data) ? data : (data?.results || []));
      }
      setIsSearching(false);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user, likes, dislikes]);

  const fetchMoviesByCategory = useCallback((categoryIndex) => {
    const category = CATEGORIES[categoryIndex];
    if (category) {
      fetchMovies(category.fetchFn);
    }
  }, [fetchMovies]);

  const handleSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchQuery('');
      setActiveTab(0);
      fetchMoviesByCategory(0);
      return;
    }

    setIsSearching(true);
    setIsLoading(true);
    setError(null);
    setSearchQuery(searchTerm);
    
    try {
      const data = await searchMovies(searchTerm);
      setMovies(data.results || []);
    } catch (err) {
      console.error('Error searching movies:', err);
      setError('Failed to search movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchMoviesByCategory]);

  // Load initial data
  useEffect(() => {
    // For logged-in users, show 'For You' tab by default
    // For non-logged-in users, show 'Popular' tab
    const initialTab = user ? 0 : 2; // 'For You' is index 0, 'Popular' is index 2
    setActiveTab(initialTab);
    fetchMovies(CATEGORIES[initialTab].fetchFn);
  }, [user, fetchMovies]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
    fetchMoviesByCategory(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Discover Your Next Favorite MOVIESIEISI
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Find, explore, and track movies you love
        </Typography>
        
        <SearchSection onSearch={handleSearch} />
      </Box>

      {!isSearching && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-flexContainer': {
                justifyContent: ['center', 'flex-start'],
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 120,
                px: 2,
              },
            }}
          >
            {CATEGORIES.map((category, index) => (
              <Tab key={category.id} label={category.label} />
            ))}
          </Tabs>
        </Box>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" my={4}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => isSearching ? handleSearch(searchQuery) : fetchMoviesByCategory(activeTab)}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {searchQuery && (
            <Typography variant="h6" mb={3}>
              Search results for: <strong>"{searchQuery}"</strong>
              <Button 
                color="primary" 
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab(0);
                  fetchMoviesByCategory(0);
                }}
                sx={{ ml: 2 }}
              >
                Clear search
              </Button>
            </Typography>
          )}
          
          <Grid container spacing={4}>
            {movies.length > 0 ? (
              movies.map((movie) => (
                <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3}>
                  <MovieCard 
                    movie={{
                      ...movie,
                      isLiked: likes?.includes(movie.id.toString()),
                      isDisliked: dislikes?.includes(movie.id.toString())
                    }} 
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6" textAlign="center" my={4}>
                  {searchQuery 
                    ? `No movies found for "${searchQuery}". Try a different search term.`
                    : 'No movies found. Please try again later.'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default LandingPage;
