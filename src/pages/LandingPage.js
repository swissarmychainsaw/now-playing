import React, { useEffect } from 'react';
import { Container } from '@mui/material';

// Components
import SearchSection from '../components/landing/SearchSection/SearchSection';
import RecommendationTabs from '../components/landing/RecommendationTabs/RecommendationTabs';
import MovieGrid from '../components/landing/MovieGrid/MovieGrid';
import ErrorState from '../components/landing/ErrorState/ErrorState';

// Hooks
import { useLandingPage, RECOMMENDATION_TYPES } from '../hooks/useLandingPage';

const LandingPage = () => {
  const {
    // State
    movies,
    loading,
    error,
    searchTerm,
    activeTab,
    
    // Handlers
    setSearchTerm,
    handleSearch,
    handleTabChange,
    fetchMovies
  } = useLandingPage();
  
  // Load initial recommendations
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchMovies(RECOMMENDATION_TYPES.FOR_YOU);
      } catch (err) {
        console.error('Error in loadInitialData:', err);
      }
    };
    
    loadInitialData();
  }, [fetchMovies]);
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    handleSearch(e);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle tab change
  const handleTabChangeWrapper = (type) => {
    handleTabChange(type);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Section */}
      <SearchSection 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />
      
      {/* Recommendation Tabs */}
      <RecommendationTabs 
        activeTab={activeTab}
        onTabChange={handleTabChangeWrapper}
      />
      
      {/* Error State */}
      {error && !loading && (
        <ErrorState 
          error={error} 
          onRetry={() => fetchMovies(activeTab || RECOMMENDATION_TYPES.FOR_YOU)}
        />
      )}
      
      {/* Movie Grid */}
      <MovieGrid 
        movies={movies}
        loading={loading}
        error={error}
      />
    </Container>
  );
};

export default LandingPage;
