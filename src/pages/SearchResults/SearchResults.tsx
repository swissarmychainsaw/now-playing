import { useState, useEffect, useCallback, useRef, useMemo, FC } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner, FaExclamationCircle, FaSearch, FaSadTear } from 'react-icons/fa';
import { motion } from 'framer-motion';
import MovieCard from '../../components/MovieCard/MovieCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useRatings } from '../../context/RatingsContext';
import { saveRating } from '../../services/ratings';
import tmdbService from '../../services/tmdb';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
  [key: string]: any;
}

const SearchResults: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = searchParams.get('q') || '';
  const prevSearchQueryRef = useRef('');
  const abortControllerRef = useRef(null);
  
  const { user } = useAuth();
  const { ratings } = useRatings();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  
  // Memoize the search handler to prevent unnecessary re-renders
  const handleSearch = useCallback((newQuery) => {
    const trimmedNewQuery = newQuery.trim();
    const trimmedCurrentQuery = searchQuery.trim();
    
    if (trimmedNewQuery !== trimmedCurrentQuery) {
      // Update the URL with the new search query
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('q', trimmedNewQuery);
      
      // Replace the current entry in the history stack to prevent back button issues
      navigate(
        { search: newSearchParams.toString() },
        { replace: trimmedCurrentQuery === '' }
      );
    }
  }, [searchQuery, navigate, location.search]);

  const handleRateMovie = useCallback(async (movieId, rating) => {
    if (!user) return;
    
    try {
      await saveRating(user.uid, {
        movieId,
        rating,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving rating:', err);
    }
  }, [user]);

  // Memoize the search function to avoid recreating it on every render
  const performSearch = useCallback(async (query, signal) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    try {
      console.log('Fetching search results for:', query);
      const searchData = await tmdbService.searchMovies(query, { 
        signal,
        page: 1,
        includeAdult: false
      });

      console.log('Raw search data received:', searchData);
      
      // Process the results to match the expected format
      return Array.isArray(searchData?.results) 
        ? searchData.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview || 'No overview available',
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            genre_ids: movie.genre_ids || []
          }))
        : [];
    } catch (error) {
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        console.error('Search error:', {
          name: error.name,
          message: error.message,
          code: error.code,
          status: error.status
        });
        throw error;
      }
      return [];
    }
  }, []);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    
    const search = async () => {
      const query = searchQuery.trim();
      
      // Skip if the query hasn't changed
      if (query === prevSearchQueryRef.current) {
        return;
      }
      
      // Update the previous query ref
      prevSearchQueryRef.current = query;
      
      // Skip if query is empty
      if (!query) {
        setSearchResults([]);
        setError(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const results = await performSearch(query, controller.signal);
        
        if (isMounted && !controller.signal.aborted) {
          setSearchResults(results);
          if (results.length === 0) {
            setError('No results found. Try a different search term.');
          }
        }
      } catch (err) {
        if (isMounted && !controller.signal.aborted) {
          setError(`Failed to fetch search results: ${err.message}`);
          setSearchResults([]);
        }
      } finally {
        if (isMounted && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    
    // Add a small delay to avoid making too many requests while typing
    const timeoutId = setTimeout(search, 300);
    
    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery, performSearch]);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <SearchBar 
              initialQuery={searchQuery} 
              onSearch={handleSearch} 
              className="max-w-2xl mx-auto"
              isLoading={isLoading}
            />
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold">Searching for "{searchQuery}"</h2>
            <p className="text-gray-400 mt-2">Finding the best matches...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Search Results</h1>
          
          <div className="mb-8">
            <SearchBar 
              initialQuery={searchQuery} 
              onSearch={handleSearch} 
              className="max-w-2xl mx-auto"
            />
          </div>
          
          <div className="bg-red-500/10 border-l-4 border-red-500 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
            <div className="flex items-start">
              <FaExclamationCircle className="text-red-500 text-2xl mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-1">Error Loading Results</h3>
                <p className="text-gray-300">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {searchQuery ? `Results for "${searchQuery}"` : 'Search Movies'}
          {searchResults.length > 0 && (
            <span className="ml-3 text-lg font-normal text-gray-400">
              ({searchResults.length} {searchResults.length === 1 ? 'result' : 'results'})
            </span>
          )}
        </h1>
        
        <div className="mb-8">
          <SearchBar 
            initialQuery={searchQuery} 
            onSearch={handleSearch} 
            className="max-w-2xl mx-auto"
            isLoading={isLoading}
          />
        </div>
        
        {searchResults.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {searchResults.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MovieCard
                  movie={movie}
                  onRate={handleRateMovie}
                  userRating={ratings.find(r => r.movieId === movie.id)?.rating}
                  isAuthenticated={!!user}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : searchQuery ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <FaSadTear className="mx-auto text-6xl text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No results found for "{searchQuery}"</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              We couldn't find any movies matching your search. Try different keywords or check your spelling.
            </p>
            <button
              onClick={() => {
                setSearchResults([]);
                navigate('/search');
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-20"
          >
            <FaSearch className="mx-auto text-6xl text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Search for movies</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter a movie title in the search bar above to find your favorite films.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
