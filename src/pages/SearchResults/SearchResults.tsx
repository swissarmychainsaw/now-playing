import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaExclamationCircle, FaSearch, FaSadTear, FaFilm, FaUserTie, FaUserFriends, FaTheaterMasks } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Box, Container } from '@mui/material';

// Type for recommendation match
type RecommendationMatch = {
  type: 'director' | 'actor' | 'genre' | 'keyword' | 'similar';
  value: string;
  score?: number;
};

// Extended Movie type with recommendation matches
type MovieWithMatches = Movie & {
  matches?: RecommendationMatch[];
};
import MovieCard from '../../components/MovieCard/MovieCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useRatings } from '../../context/RatingsContext';
import recommendationEngine from '../../services/recommendationEngine';
import { Movie, SearchResult, MovieDetails } from '../../types/movie';
import { saveRating } from '../../services/ratings';
import tmdbService from '../../services/tmdb';
import MovieRecommendations from '../../components/MovieRecommendations/MovieRecommendations';

interface Rating {
  movieId: number;
  rating: number;
}

// Type for TMDB API response
interface TMDBResponse {
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState<string>(query);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<MovieWithMatches[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  
  // Define the auth context type
  interface AuthContextType {
    isAuthenticated: boolean;
    user: any; // Replace 'any' with your User type if available
  }
  
  const auth = useAuth() as unknown as AuthContextType;
  const isAuthenticated = auth?.isAuthenticated || false;
  const user = auth?.user || null;
  
  const { ratings, refreshRatings } = useRatings();
  const navigate = useNavigate();
  
  const observer = useRef<IntersectionObserver | null>(null);
  const prevSearchQueryRef = useRef<string>(query);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const lastMovieElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && page < totalPages) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, page, totalPages]);
  
  const handleSearch = useCallback((newQuery: string) => {
    const trimmedNewQuery = newQuery.trim();
    const trimmedCurrentQuery = searchQuery.trim();
    
    if (trimmedNewQuery !== trimmedCurrentQuery) {
      setSearchQuery(trimmedNewQuery);
      setSearchResults([]);
      setPage(1);
      setError(null);
      
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('q', trimmedNewQuery);
      const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  }, [searchQuery, location.search, location.pathname]);

  const handleRateMovie = useCallback(async (movieId: number, rating: number) => {
    if (!user) return;
    
    try {
      await saveRating(user.uid, movieId.toString(), rating);
      refreshRatings();
    } catch (err) {
      console.error('Error saving rating:', err);
      setError('Failed to save rating. Please try again.');
    }
  }, [user, refreshRatings]);

  // User ratings from context
  const userRatings = useMemo(() => {
    const ratingsMap: Record<number, number> = {};
    if (ratings) {
      Object.entries(ratings).forEach(([movieId, rating]) => {
        ratingsMap[parseInt(movieId, 10)] = (rating as any)?.rating || 0;
      });
    }
    return ratingsMap;
  }, [ratings]);

  // Format recommendations for MovieRecommendations component
  const formattedRecommendations = useMemo(() => {
    return recommendations.map(rec => ({
      ...rec,
      id: rec.id,
      title: rec.title || rec.name || 'Unknown Title',
      poster_path: rec.poster_path,
      vote_average: rec.vote_average || 0,
      release_date: rec.release_date || rec.first_air_date,
      overview: rec.overview || '',
      media_type: rec.media_type || 'movie',
      _score: (rec as any)._score || 0,
      matches: (rec as any).matches || []
    }));
  }, [recommendations]);

  const fetchRecommendations = useCallback(async (movieId: number) => {
    if (!isAuthenticated) return [];
    
    setIsLoadingRecommendations(true);
    setError(null);
    
    try {
      // Get the movie details first
      const movie = await tmdbService.getMovieDetails(movieId) as MovieDetails;
      
      // Get user data from ratings
      const userData = {
        ratings: ratings || {},
        watchlist: [], // Add watchlist if available
        preferences: {} // Add user preferences if available
      };
      
      // Get recommendations
      const recommendedMovies = await recommendationEngine.getRecommendations(movie, userData) as MovieDetails[];
      
      // Get full details for recommended movies
      const detailedRecommendations = await Promise.all<MovieDetails | null>(
        recommendedMovies.slice(0, 6).map(async (rec) => {
          try {
            const details = await tmdbService.getMovieDetails(rec.id) as MovieDetails;
            return {
              ...details,
              media_type: 'movie',
              poster_path: details.poster_path,
              vote_average: details.vote_average,
              release_date: details.release_date || details.first_air_date,
              title: details.title || details.name
            } as MovieDetails;
          } catch (err) {
            console.error('Error fetching movie details:', err);
            return null;
          }
        })
      );
      
      // Filter out any failed requests
      const validRecommendations = detailedRecommendations.filter((rec): rec is MovieDetails => rec !== null);
      setRecommendations(validRecommendations);
      return validRecommendations;
      
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
      return [];
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [isAuthenticated, ratings]);

  const MAX_RESULTS = 5; // Limit to 5 search results

  const performSearch = useCallback(async (query: string, pageNum: number, signal?: AbortSignal) => {
    // Don't set loading state if this is a pagination request
    if (pageNum === 1) {
      setIsLoading(true);
      setRecommendations([]);
    }
    setError(null);

    try {
      const response = await tmdbService.searchMovies(query, { 
        signal,
        page: 1, // Always fetch first page since we're limiting to 5 results
        includeAdult: false
      }) as TMDBResponse;
      
      if (response?.results) {
        const limitedResults = response.results.slice(0, MAX_RESULTS);
        setSearchResults(limitedResults);
        setTotalPages(1); // Only one page since we're limiting results
        setTotalResults(Math.min(MAX_RESULTS, response.total_results || 0));
        
        // Fetch recommendations based on first result
        if (limitedResults.length > 0 && isAuthenticated) {
          fetchRecommendations(limitedResults[0].id);
        }
        
        return limitedResults;
      }
      
      setSearchResults([]);
      setTotalPages(1);
      setTotalResults(0);
      return [];
      
    } catch (err: any) {
      if (axios.isCancel(err) || err.code === 'ERR_CANCELED' || err.name === 'AbortError') {
        return [];
      }
      
      console.error('Search error:', err);
      setError('Failed to fetch search results. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchResults = async () => {
      try {
        await performSearch(searchQuery, page, controller.signal);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Search error:', err);
        }
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [searchQuery, page, performSearch]);

  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== prevSearchQueryRef.current) {
      prevSearchQueryRef.current = urlQuery;
      setSearchQuery(urlQuery);
      setPage(1);
      setSearchResults([]);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPage(1);
      setSearchResults([]);
    }
  };

  return (
    <Box
      component="div"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 12 },
          px: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mb: 6 }}>
          <SearchBar
            initialQuery={searchQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search for a movie..."
            showSuggestions={false}
          />
        </Box>
        
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 3,
            p: { xs: 2, md: 4 },
            color: 'text.primary',
            flex: 1,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <FaSpinner className="animate-spin text-2xl text-blue-500" />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <FaExclamationCircle className="mx-auto text-4xl text-red-500 mb-4" />
              <p className="text-lg text-gray-700">{error}</p>
            </Box>
          ) : searchResults.length > 0 ? (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <h2 className="text-2xl font-bold text-gray-900">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchQuery}"
                </h2>
                <span className="text-sm text-gray-500">
                  Showing {Math.min(5, totalResults)} of {totalResults}
                </span>
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: 'repeat(2, 1fr)', 
                  sm: 'repeat(3, 1fr)', 
                  md: 'repeat(4, 1fr)', 
                  lg: 'repeat(5, 1fr)' 
                }, 
                gap: 3 
              }}>
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.id}-${index}`}
                    ref={index === searchResults.length - 1 ? lastMovieElementRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MovieCard 
                      movie={{
                        id: result.id,
                        title: result.title || result.name || 'Unknown Title',
                        poster_path: result.poster_path,
                        vote_average: result.vote_average || 0,
                        release_date: result.release_date || result.first_air_date,
                        overview: result.overview || '',
                        media_type: result.media_type || 'movie'
                      }}
                      showRating={isAuthenticated}
                      onRated={(rating: number) => handleRateMovie(result.id, rating)}
                    />
                  </motion.div>
                ))}
              </Box>
              
              {/* Recommendations */}
              {isAuthenticated && searchResults.length > 0 && (
                <Box sx={{ mt: 8 }}>
                  <h2 className="text-2xl font-bold mb-6">
                    Recommended For You
                    <span className="text-gray-400 text-lg ml-2">
                      (Based on "{searchResults[0]?.title || searchResults[0]?.name || 'this movie'}")
                    </span>
                  </h2>
                  
                  {isLoadingRecommendations ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <FaSpinner className="animate-spin text-2xl text-blue-500" />
                    </Box>
                  ) : error ? (
                    <Box sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1, mb: 3 }}>
                      <FaExclamationCircle className="inline mr-2" />
                      {error}
                    </Box>
                  ) : recommendations.length > 0 ? (
                    <MovieRecommendations 
                      recommendations={formattedRecommendations}
                      isLoading={isLoadingRecommendations}
                      onRate={(movieId: number, rating: number) => handleRateMovie(movieId, rating)}
                      onStatusChange={(movieId: number, status: string) => {
                        // Handle status change if needed
                        console.log(`Status changed for movie ${movieId} to ${status}`);
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No recommendations found. Try a different search or rate more movies to get better recommendations.
                    </p>
                  )}
                </Box>
              )}
            </Box>
          ) : searchQuery ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <FaSadTear className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                We couldn't find any movies matching "{searchQuery}".
              </p>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <FaFilm className="mx-auto text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Search for movies or TV shows</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a title in the search bar above to get started.
              </p>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
