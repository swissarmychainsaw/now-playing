import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, CircularProgress, Grid, Tabs, Tab, Button } from '@mui/material';
import { useUser } from '../context/UserContext';
import MovieCard from '../components/MovieCard';
import SearchSection from '../components/landing/SearchSection/SearchSection';
import { searchMovies } from '../services/tmdb';
import { 
  getForYouRecommendations,
  getOscarWinners,
  getCriticsPicks,
  getPersonalizedRecommendations
} from '../services/recommendations';
import './LandingPage.css';

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
    <div className="landing-container">
      <Container maxWidth="lg" sx={{ 
        position: 'relative',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        pt: { xs: 8, md: 16 },
        pb: 8
      }}>
        {/* Visual container for rule of thirds grid (for reference) */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          zIndex: -1,
          opacity: 0.1, // Make grid lines very subtle
          pointerEvents: 'none'
        }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ border: '1px dashed', borderColor: 'primary.main' }} />
          ))}
        </Box>

        {/* Main content positioned according to rule of thirds */}
        <Box sx={{
          gridRow: '2 / 3',
          gridColumn: '1 / -1',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          position: 'relative',
          zIndex: 1
        }}>
          <Box
            component="img"
            src="/images/Discover.png"
            alt="Discover Your Next Favorite Movie. Find, explore, and rate movies you love."
            sx={{
              maxWidth: { xs: '80%', sm: '60%', md: '40%' },
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              mb: 4,
              transform: 'translateY(-20%)', // Position in the top third
              '@media (max-width: 600px)': {
                transform: 'translateY(-10%)',
              }
            }}
          />

          <Box sx={{
            width: '100%',
            maxWidth: 800,
            px: 2,
            transform: 'translateY(-30%)', // Position in the middle third
            '@media (max-width: 600px)': {
              transform: 'translateY(-10%)',
            }
          }}>
            <SearchSection 
              searchTerm={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearchSubmit={handleSearch}
            />
          </Box>
        </Box>

          {!isSearching && (
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              mb: 4,
              '& .MuiTabs-flexContainer': {
                justifyContent: ['center', 'flex-start'],
              },
              '& .MuiTab-root': {
                minWidth: 'auto',
                padding: '12px 16px',
                textTransform: 'none',
                fontWeight: 500,
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                {CATEGORIES.map((category) => (
                  <Tab 
                    key={category.id} 
                    label={category.label} 
                    sx={{ minWidth: 'auto' }} 
                  />
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    Search results for: <strong>"{searchQuery}"</strong>
                  </Typography>
                  <Button 
                    variant="outlined"
                    color="primary" 
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab(0);
                      fetchMoviesByCategory(0);
                    }}
                  >
                    Clear search
                  </Button>
                </Box>
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
    </div>
  );
};

export default LandingPage;
