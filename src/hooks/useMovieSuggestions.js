import { useState, useEffect } from 'react';
import { apiCache } from '../utils/cache';

// Cache configuration
const SUGGESTION_CACHE_KEY_PREFIX = 'suggest-';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const useMovieSuggestions = (query, delay = 300) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch movie suggestions from TMDB API
  useEffect(() => {
    const fetchSuggestions = async () => {
      const searchQuery = query.trim();
      
      // Don't fetch if query is too short
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      const cacheKey = `${SUGGESTION_CACHE_KEY_PREFIX}${searchQuery.toLowerCase()}`;
      const cachedData = apiCache.get(cacheKey);
      
      // Return cached data if available
      if (cachedData) {
        setSuggestions(cachedData.data);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) {
          throw new Error('TMDB API key is not configured');
        }

        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
            searchQuery
          )}&page=1&include_adult=false`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.status_message || `API request failed with status ${response.status}`
          );
        }

        const data = await response.json();
        const limitedResults = data.results.slice(0, 5); // Limit to 5 suggestions
        
        // Cache the results
        apiCache.set(cacheKey, { data: limitedResults }, CACHE_DURATION);

        setSuggestions(limitedResults);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError({
          message: err.message || 'Failed to fetch suggestions',
          code: err.status_code || 500,
        });
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, delay);

    // Cleanup function
    return () => clearTimeout(timer);
  }, [query, delay]);

  // Clear suggestions when query is cleared
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setError(null);
    }
  }, [query]);

  return {
    suggestions,
    isLoading,
    error,
  };
};

export default useMovieSuggestions;
