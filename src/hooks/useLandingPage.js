import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

export const RECOMMENDATION_TYPES = {
  FOR_YOU: 'for_you',
  OSCAR: 'oscar',
  POPULAR: 'popular',
  CRITICS: 'critics'
};

export const useLandingPage = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendationType, setRecommendationType] = useState(RECOMMENDATION_TYPES.FOR_YOU);
  
  const { user, likes } = useUser();
  const isFetchingRef = useRef(false);

  // Fetch movies based on recommendation type
  const fetchMovies = useCallback(async (type = RECOMMENDATION_TYPES.FOR_YOU) => {
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError('');
    setRecommendationType(type);

    try {
      let url = 'https://api.themoviedb.org/3/discover/movie';
      const params = {
        api_key: process.env.REACT_APP_TMDB_API_KEY,
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: 1,
        'vote_count.gte': 50
      };

      // Set parameters based on recommendation type
      switch (type) {
        case RECOMMENDATION_TYPES.FOR_YOU:
          // Default to popular movies if no likes
          if (!likes || likes.length === 0) {
            url = 'https://api.themoviedb.org/3/movie/popular';
          } else {
            // Get recommendations based on liked movies
            params.with_genres = likes.join(',');
          }
          break;
          
        case RECOMMENDATION_TYPES.OSCAR:
          // Get Oscar-winning movies
          params['vote_average.gte'] = 7.5;
          params['vote_count.gte'] = 1000;
          params.with_original_language = 'en';
          params['primary_release_date.gte'] = '2000-01-01';
          break;
          
        case RECOMMENDATION_TYPES.POPULAR:
          // Get popular movies
          url = 'https://api.themoviedb.org/3/movie/popular';
          params['vote_average.gte'] = 6.0;
          params['vote_count.gte'] = 50;
          break;
          
        case RECOMMENDATION_TYPES.CRITICS:
          // Get critically acclaimed movies
          params['vote_average.gte'] = 7.0;
          params['vote_count.gte'] = 100;
          params['primary_release_date.gte'] = '2015-01-01';
          break;
          
        default:
          console.warn(`Unknown recommendation type: ${type}`);
      }

      console.log('Fetching movies with params:', { ...params, api_key: '***' });
      const response = await axios.get(url, { 
        params,
        timeout: 10000 // 10 second timeout
      });

      // Filter out already liked movies and ensure we have valid data
      const filteredMovies = (response.data.results || [])
        .filter(movie => movie && movie.id && !likes?.includes(movie.id))
        .slice(0, 5);

      // If no movies after filtering, show some results anyway
      const finalMovies = filteredMovies.length > 0 
        ? filteredMovies 
        : (response.data.results || []).slice(0, 5);

      setMovies(finalMovies);
      
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
      setMovies([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [likes]);

  // Handle search submission
  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: process.env.REACT_APP_TMDB_API_KEY,
          query: searchTerm,
          page: 1,
          language: 'en-US',
          include_adult: false
        },
        timeout: 10000
      });
      
      setMovies(response.data.results.slice(0, 5)); // Limit to 5 results
      setRecommendationType(null); // Clear active recommendation type
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Handle tab change
  const handleTabChange = useCallback((type) => {
    setRecommendationType(type);
    fetchMovies(type);
  }, [fetchMovies]);

  // Load initial recommendations
  useEffect(() => {
    if (!user?.uid) return;
    
    const loadInitialData = async () => {
      try {
        await fetchMovies(RECOMMENDATION_TYPES.FOR_YOU);
      } catch (err) {
        console.error('Error in loadInitialData:', err);
        setError('Failed to load recommendations. Please try again later.');
      }
    };
    
    loadInitialData();
  }, [user?.uid, fetchMovies]);

  return {
    // State
    movies,
    loading,
    error,
    searchTerm,
    activeTab: recommendationType,
    
    // Handlers
    setSearchTerm,
    handleSearch,
    handleTabChange,
    fetchMovies
  };
};
