import React, { FC, useState, useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent, MouseEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaSpinner, FaFilm } from 'react-icons/fa';

// Extend the global ImportMeta interface for Vite environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_TMDB_API_KEY: string;
    // Add other environment variables as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export interface SearchBarProps {
  /** Initial search query value */
  initialQuery?: string;
  
  /** Callback function called when a search is submitted */
  onSearch?: (query: string) => void;
  
  /** Whether the search is currently loading */
  isLoading?: boolean;
  
  /** Additional CSS class name */
  className?: string;
  
  /** Whether to show search suggestions */
  showSuggestions?: boolean;
  
  /** Placeholder text for the search input */
  placeholder?: string;
}

export interface MovieSuggestion {
  /** The TMDB ID of the movie, TV show, or person */
  id: number;
  
  /** The title of the movie (if it's a movie) */
  title?: string;
  
  /** The name of the TV show or person (if it's a TV show or person) */
  name?: string;
  
  /** The path to the poster image (for movies and TV shows) */
  poster_path?: string | null;
  
  /** The path to the profile image (for people) */
  profile_path?: string | null;
  
  /** The release date (for movies) */
  release_date?: string;
  
  /** The first air date (for TV shows) */
  first_air_date?: string;
  
  /** The type of media (movie, tv, or person) */
  media_type?: 'movie' | 'tv' | 'person';
  
  /** Allow additional properties */
  [key: string]: any;
}

const SearchBar: FC<SearchBarProps> = ({
  initialQuery = '',
  onSearch,
  isLoading = false,
  className = '',
  showSuggestions = true,
  placeholder = 'Search for a movie...'
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Update internal state if initialQuery changes
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
      // Clear suggestions and hide dropdown when initialQuery changes
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
    }
  }, [initialQuery]);
  
  // Prevent dropdown from automatically opening on mount or when query changes
  useEffect(() => {
    // Only show dropdown when there are suggestions and the input is focused
    if (suggestions.length > 0 && isFocused) {
      setShowSuggestionsDropdown(true);
    } else {
      setShowSuggestionsDropdown(false);
    }
  }, [suggestions, isFocused]);

  // Handle search submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e?.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      // Clear any previous error
      setError(null);
      
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        // Only navigate if we're not already on the search page or the query is different
        const currentSearch = new URLSearchParams(location.search).get('q');
        if (!location.pathname.startsWith('/search') || currentSearch !== trimmedQuery) {
          navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`, { replace: false });
        } else {
          // If we're already on the search page with the same query, just refresh
          const searchParams = new URLSearchParams(location.search);
          searchParams.set('q', trimmedQuery);
          navigate({ search: searchParams.toString() }, { replace: true });
        }
      }
      setShowSuggestionsDropdown(false);
      inputRef.current?.blur();
    }
  }, [query, onSearch, navigate, location.pathname, location.search]);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1&include_adult=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      setSuggestions(data.results || []);
      // Don't automatically show dropdown here, let the useEffect handle it based on focus
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to load suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [showSuggestions]);

  // Debounce search suggestions
  useEffect(() => {
    if (!query.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    const timerId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [query, showSuggestions, fetchSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((movie: MovieSuggestion) => {
    const movieTitle = movie.title || movie.name || '';
    setQuery(movieTitle);
    setShowSuggestionsDropdown(false);
    setSuggestions([]); // Clear suggestions
    
    if (onSearch) {
      onSearch(movieTitle);
    } else if (movie.id) {
      // If we have a movie ID, navigate to the movie details page
      navigate(`/movie/${movie.id}`);
    } else if (movieTitle) {
      // Otherwise, perform a search with the movie title
      navigate(`/search?q=${encodeURIComponent(movieTitle)}`);
    }
    
    // Blur the input to close the keyboard on mobile
    inputRef.current?.blur();
  }, [onSearch, navigate]);

  // Clear search input
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
    
    // If we're on the search page, clear the search results
    if (location.pathname.startsWith('/search')) {
      navigate('/search', { replace: true });
    }
  }, [navigate, location.pathname]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.trim() && showSuggestions) {
      fetchSuggestions(newQuery);
    } else {
      setSuggestions([]);
      setShowSuggestionsDropdown(false);
    }
  }, [showSuggestions, fetchSuggestions]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (query.trim().length >= 2) {
      setShowSuggestionsDropdown(true);
    }
  }, [query]);

  // Handle input blur with a small delay to allow clicks on suggestions
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowSuggestionsDropdown(false);
      }
    }, 200);
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    };

    // Add event listener when dropdown is visible
    if (showSuggestionsDropdown) {
      document.addEventListener('mousedown', handleClickOutside as any);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as any);
    };
  }, [showSuggestionsDropdown]);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (showSuggestions && suggestions.length > 0) {
          e.preventDefault();
          setActiveSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        if (showSuggestions && suggestions.length > 0) {
          e.preventDefault();
          setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        setShowSuggestionsDropdown(false);
        if (activeSuggestionIndex >= 0 && showSuggestions && suggestions.length > 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else {
          handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
        break;
      case 'Escape':
        setShowSuggestionsDropdown(false);
        break;
      default:
        break;
    }
  }, [showSuggestions, suggestions, activeSuggestionIndex, handleSuggestionClick, handleSubmit]);

  // Set up event listeners for keyboard navigation
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleKeyDown = (e: Event) => {
      // Use a type assertion through unknown to satisfy TypeScript's type checking
      const keyboardEvent = e as unknown as KeyboardEvent;
      if (keyboardEvent.key === 'Escape') {
        setShowSuggestionsDropdown(false);
        input.blur();
      }
    };

    input.addEventListener('keydown', handleKeyDown);
    return () => {
      input.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center transition-all duration-200 ${
            isFocused ? 'ring-2 ring-blue-500' : ''
          } bg-gray-800 rounded-full overflow-hidden`}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-5 py-3 pl-12 pr-10 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
            aria-label="Search movies"
            aria-haspopup="listbox"
            aria-expanded={showSuggestionsDropdown && suggestions.length > 0}
            aria-owns="search-suggestions"
          />
          <FaSearch className="absolute left-4 text-gray-400" />
          
          {isLoading ? (
            <div className="absolute right-12 text-blue-400">
              <FaSpinner className="animate-spin" />
            </div>
          ) : query ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          ) : null}
          
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`px-4 h-full flex items-center justify-center ${
              isLoading || !query.trim()
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
            aria-label="Search"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <span className="font-medium">Search</span>
            )}
          </button>
        </div>
      </form>

      {/* Search suggestions */}
      <AnimatePresence>
        {showSuggestions && showSuggestionsDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-xl overflow-hidden"
            id="search-suggestions"
            role="listbox"
          >
            <ul className="py-1 max-h-96 overflow-y-auto" role="listbox">
              {suggestions.map((movie) => {
                const title = movie.title || movie.name || 'Untitled';
                const year = movie.release_date || movie.first_air_date;
                const mediaType = movie.media_type || 'movie';
                const posterPath = movie.poster_path || movie.profile_path;
                
                return (
                  <li
                    key={`${movie.id}-${mediaType}`}
                    onClick={() => handleSuggestionClick(movie)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-700 flex items-center space-x-3 transition-colors group"
                    role="option"
                    aria-selected="false"
                  >
                    {posterPath ? (
                      <div className="flex-shrink-0 relative w-10 h-14 rounded overflow-hidden bg-gray-700">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${posterPath}`}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width="40"
                          height="56"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextSibling = target.nextElementSibling as HTMLElement;
                            if (nextSibling) {
                              nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="absolute inset-0 hidden items-center justify-center bg-gray-700">
                          <FaFilm className="text-gray-500 text-lg" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                        <FaFilm className="text-gray-500 text-lg" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                          {title}
                        </p>
                        {mediaType === 'tv' && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                            TV
                          </span>
                        )}
                        {mediaType === 'person' && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                            Person
                          </span>
                        )}
                      </div>
                      {year ? (
                        <p className="text-xs text-gray-400">
                          {new Date(year).getFullYear() || 'N/A'}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">Release date N/A</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
