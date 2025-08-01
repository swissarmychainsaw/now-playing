import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebounce from './useDebounce';
import { apiCache } from '../utils/cache';
import tmdbService from '../services/tmdb';

// Cache keys
const SEARCH_CACHE_KEY_PREFIX = 'search-';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useMovieSearch = (initialQuery = '') => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Memoize the search function
  const searchMovies = useCallback(async (searchQuery, pageNumber = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
      return;
    }

    const cacheKey = `${SEARCH_CACHE_KEY_PREFIX}${searchQuery}-${pageNumber}`;
    const cachedData = apiCache.get(cacheKey);
    
    // Return cached data if available
    if (cachedData) {
      setResults(prevResults => 
        pageNumber === 1 ? cachedData.data.results : [...prevResults, ...cachedData.data.results]
      );
      setTotalPages(cachedData.data.total_pages);
      setTotalResults(cachedData.data.total_results);
      setPage(pageNumber);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching search results for:', searchQuery, 'page:', pageNumber);
      const data = await tmdbService.searchMovies(searchQuery, { 
        page: pageNumber,
        includeAdult: false
      });

      // Add a small delay to show loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      
      // Cache the results
      apiCache.set(cacheKey, { data }, CACHE_DURATION);

      setResults(prevResults => 
        pageNumber === 1 ? data.results : [...prevResults, ...data.results]
      );
      setTotalPages(data.total_pages);
      setTotalResults(data.total_results);
      setPage(pageNumber);
      
      // Update URL search params
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (pageNumber > 1) {
        params.set('page', pageNumber);
      }
      setSearchParams(params, { replace: true });
      
    } catch (err) {
      console.error('Error searching movies:', err);
      setError({
        message: err.message || 'Failed to fetch search results. Please try again.',
        code: err.status_code || 500,
      });
      // Reset results on error
      if (pageNumber === 1) {
        setResults([]);
        setTotalPages(1);
        setTotalResults(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setSearchParams]);

  // Use the useDebounce hook
  const debouncedQuery = useDebounce(query, 500);

  // Handle search query changes with debounce
  useEffect(() => {
    if (debouncedQuery) {
      searchMovies(debouncedQuery, 1);
    } else {
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
    }
  }, [debouncedQuery, searchMovies]);

  // Handle page changes with smooth scroll
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      searchMovies(query, newPage);
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [query, page, totalPages, searchMovies]);

  // Initialize from URL on mount
  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    const pageNumber = parseInt(searchParams.get('page') || '1', 10);
    
    if (searchQuery) {
      setQuery(searchQuery);
      // Don't trigger search here, let the debounced effect handle it
    } else if (pageNumber > 1) {
      // If there's a page number but no query, reset to page 1
      searchParams.delete('page');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function if needed
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    page,
    totalPages,
    totalResults,
    handlePageChange,
    searchMovies: (searchQuery) => {
      setQuery(searchQuery);
      // Reset to page 1 for new searches
      searchMovies(searchQuery, 1);
    },
  };
};

export default useMovieSearch;
