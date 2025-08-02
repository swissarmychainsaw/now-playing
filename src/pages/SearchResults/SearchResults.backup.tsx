import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResults.css';
import { 
  FaSpinner, 
  FaExclamationCircle, 
  FaSadTear, 
  FaFilm, 
  FaStar, 
  FaPlay, 
  FaTimes, 
  FaRegStar, 
  FaRegBookmark, 
  FaRegThumbsDown,
  FaBookmark,
  FaThumbsDown,
  FaPlayCircle,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Box, Container, Grid as MuiGrid, Typography, CircularProgress, Chip, Button, Popover, Fade } from '@mui/material';
import SearchBar from '../../components/SearchBar/SearchBar';
import MovieCard from '../../components/MovieCard/MovieCard';
import { useAuth } from '../../context/AuthContext';
import { useRatings } from '../../context/RatingsContext';
import { saveRating } from '../../services/ratings';
import tmdbService from '../../services/tmdb';
import { SearchResult, Movie } from '../../types/movie';
import { 
  TmdbMovie, 
  TmdbTvShow, 
  TmdbPaginatedResponse, 
  TmdbMovieDetails,
  TmdbCredits
} from '../../types/tmdb';

// Create a custom type that extends the MovieCard props with our additional props
type CustomMovieCardProps = React.ComponentProps<typeof MovieCard> & {
  onRate?: (movieId: number, rating: number, movie?: any) => void;
  onStatusChange?: (movieId: number, status: string, movie?: any) => void;
};

// Define the shape of the TMDB search response
interface SearchResponse {
  results?: SearchResult[];
  total_results?: number;
  page?: number;
  total_pages?: number;
}

// Define the Auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<any>;
  signOut: () => Promise<void>;
}

// Extend the Movie interface to include all possible properties
interface ExtendedMovie extends Omit<Movie, 'poster_path'> {
  name?: string;
  first_air_date?: string;
  origin_country?: string[];
  original_name?: string;
  media_type?: string;
  genre_ids?: number[];
  original_language?: string;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  adult?: boolean;
  original_title?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  title?: string;
  vote_average?: number;
  release_date?: string;
  overview?: string;
  id: number;
}

// Define the Genre interface
interface Genre {
  id: number;
  name: string;
}

// Define the Provider interface
interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// Update the Recommendation interface to handle both movie and TV show types
interface Recommendation extends Omit<TmdbMovie, 'title' | 'release_date'> {
  media_type: 'movie' | 'tv';
  title: string;
  release_date: string;
  name?: string;
  first_air_date?: string;
}

// Update the RecommendationSection interface
interface RecommendationSection {
  title: string;
  items: Recommendation[];
  loading: boolean;
  error: string | null;
}

const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
};

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [selectedMovie, setSelectedMovie] = useState<SearchResult | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerSource, setTrailerSource] = useState<string>('');
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const [showProviders, setShowProviders] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isWatchlisted, setIsWatchlisted] = useState<boolean>(false);
  const [isNotInterested, setIsNotInterested] = useState<boolean>(false);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverImage, setPopoverImage] = useState<string>('');
  const [popoverName, setPopoverName] = useState<string>('');
  const openPopover = Boolean(popoverAnchor);

  const auth = useAuth() as AuthContextType;
  const isAuthenticated = auth?.isAuthenticated || false;
  const { refreshRatings } = useRatings();
  const navigate = useNavigate();

  // Fetch search results when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setSearchResults([]);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Add proper type assertion for the TMDB API response
        const response = await tmdbService.searchMovies(query, { page: 1 }) as {
          results?: Array<{
            id: number;
            title?: string;
            poster_path?: string | null;
            release_date?: string;
            vote_average?: number;
            overview?: string;
            media_type?: 'movie' | 'tv' | 'person';
            [key: string]: any;
          }>;
          total_results?: number;
          page?: number;
          total_pages?: number;
        };

        console.log('Raw API response:', response); // Log the raw response

        // First, filter for valid results
        const validResults = response.results?.filter(result => 
          result.id !== undefined && 
          (result.title !== undefined || result.name !== undefined)
        ) || [];

        // Then map to SearchResult type
        const processedResults: SearchResult[] = validResults.map(result => {
          const mediaType = (result.media_type === 'tv' || result.media_type === 'person') 
            ? result.media_type 
            : 'movie';
            
          return {
            id: result.id,
            title: result.title || result.name || 'Untitled',
            poster_path: result.poster_path || null,
            release_date: result.release_date || result.first_air_date || '',
            vote_average: result.vote_average || 0,
            overview: result.overview || '',
            media_type: mediaType,
            // Only include additional properties that don't conflict with SearchResult
            ...(result.original_title && { original_title: result.original_title }),
            ...(result.genre_ids && { genre_ids: result.genre_ids }),
            ...(result.popularity && { popularity: result.popularity }),
            ...(result.vote_count && { vote_count: result.vote_count }),
            ...(result.backdrop_path && { backdrop_path: result.backdrop_path }),
            ...(result.original_language && { original_language: result.original_language }),
            ...(result.adult && { adult: result.adult })
          };
        });

        console.log('Processed results:', processedResults);

        setSearchResults(processedResults);
        setTotalResults(response.total_results || 0);

        // If we have results, load details for the first movie
        if (processedResults.length > 0) {
          const firstMovie = processedResults[0];
          setSelectedMovie(firstMovie);
        }
      } catch (err) {
        console.error('Error searching movies:', err);
        setError('Failed to load search results. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Fetch movie details when a movie is selected
  useEffect(() => {
    const fetchMovieDetails = async (movieId: number, mediaType: string = 'movie', title: string = '', year?: number) => {
      if (!movieId) return;
      
      setIsLoadingDetails(true);
      try {
        // Check if we have a valid API key
        if (!import.meta.env.VITE_TMDB_API_KEY) {
          throw new Error('TMDB API key is not configured');
        }

        let details, credits, providers, videos;

        if (mediaType === 'tv') {
          // For TV shows, use the TV endpoints with fallback
          [details, credits, providers, videos] = await Promise.allSettled([
            tmdbService.getTvDetails(movieId, title, year),
            tmdbService.getTvCredits(movieId),
            tmdbService.getTvWatchProviders(movieId).catch(() => ({ data: {} })),
            tmdbService.getTvVideos(movieId).catch(() => ({ data: { results: [] } }))
          ]);
        } else {
          // For movies, use the movie endpoints
          [details, credits, providers, videos] = await Promise.allSettled([
            tmdbService.getMovieDetails(movieId),
            tmdbService.getMovieCredits(movieId),
            tmdbService.getMovieWatchProviders(movieId).catch(() => ({})),
            tmdbService.getMovieVideos(movieId).catch(() => ({ results: [] }))
          ]);
        }

        // Process the results with proper type assertions
        const processedDetails = {
          ...(details.status === 'fulfilled' ? details.value : {}) as any,
          credits: (credits.status === 'fulfilled' ? credits.value : { cast: [], crew: [] }) as any,
          providers: (providers.status === 'fulfilled' ? providers.value : {}) as any,
          videos: (videos.status === 'fulfilled' ? videos.value : { results: [] }) as any,
          media_type: mediaType
        };

        setMovieDetails(processedDetails);
      } catch (error) {
        console.error('Error fetching details:', error);
        setError(`Failed to load ${mediaType === 'tv' ? 'TV show' : 'movie'} details. Please try another title.`);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    if (selectedMovie) {
      // Extract year from release_date if available
      const year = selectedMovie.release_date ? parseInt(selectedMovie.release_date.split('-')[0], 10) : undefined;
      fetchMovieDetails(
        selectedMovie.id, 
        selectedMovie.media_type || 'movie',
        selectedMovie.title || selectedMovie.name || '',
        year
      );
    }
  }, [selectedMovie]);

  // Handle search submission from the SearchBar
  const handleSearch = useCallback((newQuery: string) => {
    const trimmedNewQuery = newQuery.trim();
    if (trimmedNewQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedNewQuery)}`, { replace: true });
    }
  }, [navigate]);

  const handleRateMovie = useCallback(async (movieId: number, rating: number, movie?: any) => {
    if (!isAuthenticated) return;
    
    try {
      const movieData = {
        id: movieId.toString(),
        movieId,
        title: movie?.title || '',
        poster_path: movie?.poster_path || '',
        release_date: movie?.release_date || '',
        overview: movie?.overview || '',
        vote_average: movie?.vote_average || 0,
      };
      
      // @ts-ignore - auth context is available
      await saveRating(auth.user.uid, movieId.toString(), rating, movieData);
      refreshRatings();
    } catch (err) {
      console.error('Error saving rating:', err);
    }
  }, [isAuthenticated, refreshRatings, auth?.user?.uid]);

  const handleStatusChange = useCallback(async (movieId: number, status: string, movie?: any) => {
    if (!isAuthenticated) return;
    
    // Map status to rating value
    const ratingValue = status === 'watchlist' ? -2 : status === 'not_interested' ? -1 : 0;
    
    try {
      const movieData = {
        id: movieId.toString(),
        movieId,
        title: movie?.title || '',
        poster_path: movie?.poster_path || '',
        release_date: movie?.release_date || '',
        overview: movie?.overview || '',
        vote_average: movie?.vote_average || 0,
      };
      
      // @ts-ignore - auth context is available
      await saveRating(auth.user.uid, movieId.toString(), ratingValue, movieData);
      refreshRatings();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }, [isAuthenticated, refreshRatings, auth?.user?.uid]);

  const getTrailerUrl = (videos: any[]): { url: string | null; embedUrl: string | null } => {
    if (!videos?.length) return { url: null, embedUrl: null };
    
    // Try to find the first available trailer in order of preference
    const trailer = [
      // Official Trailer from YouTube (preferred)
      videos.find(v => 
        v.site === 'YouTube' && 
        v.type === 'Trailer' && 
        v.official &&
        v.name?.toLowerCase().includes('official trailer')
      ),
      // Any official trailer from YouTube
      videos.find(v => 
        v.site === 'YouTube' && 
        v.type === 'Trailer' && 
        v.official
      ),
      // Any trailer from YouTube (official or not)
      videos.find(v => 
        v.site === 'YouTube' && 
        v.type === 'Trailer'
      ),
      // Any YouTube video that's a teaser
      videos.find(v => 
        v.site === 'YouTube' && 
        v.type === 'Teaser'
      ),
      // Any video from YouTube
      videos.find(v => v.site === 'YouTube'),
      // Any video from any source
      videos[0]
    ].find(Boolean);

    if (!trailer) return { url: null, embedUrl: null };

    // Return the appropriate URLs based on the video source
    switch (trailer.site) {
      case 'YouTube':
        return {
          url: `https://www.youtube.com/watch?v=${trailer.key}`,
          embedUrl: `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`
        };
      case 'Vimeo':
        return {
          url: `https://vimeo.com/${trailer.key}`,
          embedUrl: `https://player.vimeo.com/video/${trailer.key}?autoplay=1&muted=1`
        };
      default:
        return trailer.key ? {
          url: `https://www.themoviedb.org/video/play?key=${trailer.key}`,
          embedUrl: `https://www.themoviedb.org/video/play?key=${trailer.key}`
        } : { url: null, embedUrl: null };
    }
  };

  useEffect(() => {
    if (movieDetails?.videos?.results?.length) {
      const { url, embedUrl } = getTrailerUrl(movieDetails.videos.results);
      setTrailerUrl(embedUrl);
      
      // Set the trailer source for display
      if (url) {
        if (url.includes('youtube')) setTrailerSource('YouTube');
        else if (url.includes('vimeo')) setTrailerSource('Vimeo');
        else setTrailerSource('TMDB');
      }
    } else {
      setTrailerUrl(null);
      setTrailerSource('');
    }
  }, [movieDetails]);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, imageUrl: string, name: string) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverImage(imageUrl);
    setPopoverName(name);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverImage('');
    setPopoverName('');
  };

  // Add recommendation state
  const [recommendations, setRecommendations] = useState<{
    byQuery: RecommendationSection;
    byGenre: RecommendationSection;
    byDirector: RecommendationSection;
  }>({
    byQuery: { title: 'Similar to your search', items: [], loading: false, error: null },
    byGenre: { title: 'In the same genre', items: [], loading: false, error: null },
    byDirector: { title: 'From the same director', items: [], loading: false, error: null },
  });

  // Update the fetchRecommendations function
  const fetchRecommendations = useCallback(async (query: string, genreIds: number[] = []) => {
    if (!query) return;
    
    // Reset recommendations
    setRecommendations({
      byQuery: { ...recommendations.byQuery, loading: true, error: null },
      byGenre: { ...recommendations.byGenre, loading: true, error: null },
      byDirector: { ...recommendations.byDirector, loading: true, error: null },
    });

    try {
      // Fetch recommendations based on search query
      const searchResponse = await tmdbService.searchMovies(query, { page: 1 });
      const searchBased = searchResponse as TmdbPaginatedResponse<TmdbMovie | TmdbTvShow>;
      
      // If we have a selected movie with genres, fetch by genre
      let genreBased: TmdbPaginatedResponse<TmdbMovie> = { 
        results: [], 
        page: 1, 
        total_pages: 0, 
        total_results: 0 
      };
      
      if (genreIds.length > 0) {
        const genreResponse = await tmdbService.discoverMovies({
          withGenres: genreIds.join(','),
          sortBy: 'popularity.desc',
          page: 1
        });
        genreBased = genreResponse as TmdbPaginatedResponse<TmdbMovie>;
      }

      // If we have a selected movie with a director, fetch by director
      let directorBased: TmdbPaginatedResponse<TmdbMovie> = { 
        results: [], 
        page: 1, 
        total_pages: 0, 
        total_results: 0 
      };
      
      if (selectedMovie?.id) {
        try {
          const details = await tmdbService.getMovieDetails(selectedMovie.id);
          const credits = await tmdbService.getMovieCredits(selectedMovie.id) as TmdbCredits;
          const director = credits.crew.find((c) => c.job === 'Director');
          
          if (director?.id) {
            const directorResponse = await tmdbService.discoverMovies({
              withCrew: director.id.toString(),
              sortBy: 'popularity.desc',
              page: 1
            });
            directorBased = directorResponse as TmdbPaginatedResponse<TmdbMovie>;
          }
        } catch (error) {
          console.error('Error fetching director details:', error);
        }
      }

      // Process and set the recommendations
      setRecommendations({
        byQuery: {
          title: 'Similar to your search',
          items: searchBased.results.slice(0, 5).map(mapToRecommendation),
          loading: false,
          error: null
        },
        byGenre: {
          title: 'In the same genre',
          items: genreBased.results.slice(0, 5).map(mapToRecommendation),
          loading: false,
          error: genreIds.length === 0 ? 'No genre information available' : null
        },
        byDirector: {
          title: 'From the same director',
          items: directorBased.results.slice(0, 5).map(mapToRecommendation),
          loading: false,
          error: !selectedMovie?.id ? 'Select a movie to see director recommendations' : null
        }
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations({
        byQuery: { ...recommendations.byQuery, loading: false, error: 'Failed to load recommendations' },
        byGenre: { ...recommendations.byGenre, loading: false, error: 'Failed to load genre recommendations' },
        byDirector: { ...recommendations.byDirector, loading: false, error: 'Failed to load director recommendations' },
      });
    }
  }, [selectedMovie]);

  // Helper function to map API response to Recommendation type
  const mapToRecommendation = (item: TmdbMovie | TmdbTvShow): Recommendation => {
    const isTvShow = 'name' in item;
    const title = isTvShow ? (item as TmdbTvShow).name : (item as TmdbMovie).title || 'Untitled';
    const releaseDate = isTvShow ? (item as TmdbTvShow).first_air_date || '' : (item as TmdbMovie).release_date || '';
    const originalTitle = isTvShow ? (item as TmdbTvShow).original_name : (item as TmdbMovie).original_title || title;
    
    return {
      ...item,
      title,
      release_date: releaseDate,
      media_type: isTvShow ? 'tv' : 'movie',
      original_title: originalTitle,
      video: false, // Default value for TV shows
      adult: false, // Default value for TV shows
      genre_ids: item.genre_ids || [],
      backdrop_path: item.backdrop_path || null,
      id: item.id,
      overview: item.overview || '',
      popularity: item.popularity || 0,
      poster_path: item.poster_path || null,
      vote_average: item.vote_average || 0,
      vote_count: item.vote_count || 0,
      original_language: item.original_language || 'en',
    };
  };

  // Call fetchRecommendations when search results change
  useEffect(() => {
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      fetchRecommendations(query, firstResult.genre_ids || []);
    }
  }, [searchResults, query, fetchRecommendations]);

  // Add this new render function before the main return
  const renderRecommendationSection = (section: RecommendationSection) => (
    <Box key={section.title} mb={4}>
      <Typography variant="h6" mb={2} fontWeight="bold">
        {section.title}
      </Typography>
      
      {section.loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : section.error ? (
        <Typography color="textSecondary" variant="body2">
          {section.error}
        </Typography>
      ) : (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }} gap={2}>
          {section.items.map((item) => (
            <div 
              key={`${section.title}-${item.id}`}
              onClick={() => {
                setSelectedMovie(item as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer' }}
            >
              <MovieCard
                movie={item as any}
              />
            </div>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
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
          color: 'text.primary'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto', mb: 6 }}>
          <SearchBar
            initialQuery={query}
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search for movies..."
            showSuggestions={true}
          />
        </Box>
        
        {isLoadingDetails ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : movieDetails ? (
          <Box mb={4}>
            <Container maxWidth="lg">
              <Box 
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* Left Column - Poster */}
                <Box 
                  sx={{
                    width: { xs: '100%', md: 250 },
                    minWidth: { md: 250 },
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    borderRight: { md: '1px solid' },
                    borderColor: 'divider',
                  }}
                >
                  <Box 
                    sx={{
                      width: '100%',
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 1,
                    }}
                  >
                    <img
                      src={movieDetails.poster_path 
                        ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
                        : '/placeholder-poster.png'}
                      alt={movieDetails.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </Box>
                </Box>

                {/* Middle Column - Movie Info */}
                <Box 
                  sx={{ 
                    flex: 1,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  {/* Rating and Watchlist Section */}
                  <Box 
                    sx={{ 
                      backgroundColor: 'background.paper',
                      borderRadius: 1,
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                      {/* Rating Section */}
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Your rating:
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Box
                              key={star}
                              component="span"
                              sx={{
                                cursor: 'pointer',
                                color: (hoveredRating || userRating) >= star ? 'warning.main' : 'action.disabled',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'scale(1.2)',
                                  color: 'warning.light',
                                },
                              }}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => {
                                const newRating = userRating === star ? 0 : star;
                                setUserRating(newRating);
                                // TODO: Add rating functionality
                                console.log(`Rated ${movieDetails.title} ${newRating} stars`);
                              }}
                            >
                              <FaStar size={24} />
                            </Box>
                          ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Rate this movie
                        </Typography>
                      </Box>
                      
                      {/* Action Buttons */}
                      <Box display="flex" gap={1} alignItems="flex-start">
                        <Button
                          variant={isWatchlisted ? 'contained' : 'outlined'}
                          size="small"
                          color={isWatchlisted ? 'primary' : 'inherit'}
                          startIcon={<FaBookmark />}
                          onClick={() => {
                            const newWatchlistStatus = !isWatchlisted;
                            setIsWatchlisted(newWatchlistStatus);
                            if (newWatchlistStatus) setIsNotInterested(false);
                            // TODO: Add watchlist functionality
                            console.log(`${newWatchlistStatus ? 'Added to' : 'Removed from'} watchlist:`, movieDetails.title);
                          }}
                          sx={{
                            textTransform: 'none',
                            minWidth: 'fit-content',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                            },
                          }}
                        >
                          {isWatchlisted ? 'Watchlisted' : 'Watchlist'}
                        </Button>
                        <Button
                          variant={isNotInterested ? 'contained' : 'outlined'}
                          size="small"
                          color={isNotInterested ? 'error' : 'inherit'}
                          startIcon={<FaTimes />}
                          onClick={() => {
                            const newNotInterestedStatus = !isNotInterested;
                            setIsNotInterested(newNotInterestedStatus);
                            if (newNotInterestedStatus) setIsWatchlisted(false);
                            // TODO: Add not interested functionality
                            console.log(`${newNotInterestedStatus ? 'Marked as' : 'Removed from'} not interested:`, movieDetails.title);
                          }}
                          sx={{
                            textTransform: 'none',
                            minWidth: 'fit-content',
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'error.contrastText',
                            },
                          }}
                        >
                          {isNotInterested ? 'Not Interested' : 'Not Interested'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Movie Title and Year */}
                  <Box>
                    <Typography 
                      variant="h5" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'text.primary',
                        lineHeight: 1.2,
                      }}
                    >
                      {movieDetails.title}
                      {movieDetails.release_date && (
                        <Typography 
                          component="span" 
                          sx={{ 
                            display: 'block',
                            fontSize: '0.8em',
                            fontWeight: 'normal',
                            color: 'text.secondary',
                            mt: 0.5
                          }}
                        >
                          {new Date(movieDetails.release_date).getFullYear()}
                          {movieDetails.tagline && (
                            <Typography component="span" sx={{ ml: 1.5, fontStyle: 'italic', opacity: 0.9, display: { xs: 'none', sm: 'inline' } }}>
                              • {movieDetails.tagline}
                            </Typography>
                          )}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  
                  {/* Metadata Row */}
                  <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <FaStar size={14} color="#FFD700" />
                      <Typography variant="body2" fontWeight={600}>
                        {movieDetails.vote_average?.toFixed(1)}
                      </Typography>
                    </Box>
                    
                    {movieDetails.runtime > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <FaClock size={12} style={{ opacity: 0.7 }} />
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.floor(movieDetails.runtime / 60)}h ${movieDetails.runtime % 60}m`}
                        </Typography>
                      </Box>
                    )}
                    
                    {movieDetails.release_date && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <FaCalendarAlt size={12} style={{ opacity: 0.7 }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(movieDetails.release_date).getFullYear()}
                        </Typography>
                      </Box>
                    )}
                    
                    {movieDetails.genres?.length > 0 && (
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {movieDetails.genres.slice(0, 2).map((genre: any) => (
                          <Chip 
                            key={genre.id}
                            label={genre.name}
                            size="small"
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              height: 'auto',
                              py: 0.5,
                              '&:hover': {
                                bgcolor: 'primary.dark',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  
                  {/* Overview */}
                  <Box>
                    <Typography 
                      variant="body2" 
                      color="text.primary"
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {movieDetails.overview}
                    </Typography>
                  </Box>
                  
                  {/* Action Buttons */}
                  <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                    <Box
                      component="button"
                      onClick={() => setShowTrailer(true)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        bgcolor: 'error.main',
                        color: 'white',
                        border: 'none',
                        borderRadius: 1,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'error.dark',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <FaPlay size={12} />
                      <span>Watch Trailer</span>
                    </Box>
                    
                    {movieDetails.providers?.flatrate?.length > 0 && (
                      <Box
                        component="button"
                        onClick={() => setShowProviders(!showProviders)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 2,
                          py: 1,
                          bgcolor: 'primary.main',
                          color: 'white',
                          border: 'none',
                          borderRadius: 1,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <FaPlayCircle size={12} />
                        <span>Where to Watch</span>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Right Column - Cast and Director */}
                {(movieDetails.credits?.cast?.length > 0 || movieDetails.credits?.crew?.some((p: any) => p.job === 'Director')) && (
                  <Box 
                    sx={{ 
                      width: { xs: '100%', md: 200 },
                      minWidth: { md: 200 },
                      p: 2,
                      borderLeft: { md: '1px solid' },
                      borderColor: 'divider',
                      display: { xs: 'none', lg: 'block' },
                    }}
                  >
                    {/* Director Section */}
                    {movieDetails.credits?.crew?.find((p: any) => p.job === 'Director') && (
                      <Box mb={3}>
                        <Typography 
                          variant="subtitle2" 
                          color="text.primary"
                          fontWeight={600}
                          mb={1}
                        >
                          Director
                        </Typography>
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={1} 
                          mb={2}
                          onMouseEnter={(e) => {
                            const director = movieDetails.credits.crew.find((p: any) => p.job === 'Director');
                            if (director?.profile_path) {
                              handlePopoverOpen(e, `https://image.tmdb.org/t/p/w500${director.profile_path}`, director.name);
                            }
                          }}
                          onMouseLeave={handlePopoverClose}
                          sx={{ cursor: 'pointer' }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              bgcolor: 'background.paper',
                              flexShrink: 0,
                              boxShadow: 1,
                            }}
                          >
                            {movieDetails.credits.crew.find((p: any) => p.job === 'Director')?.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${movieDetails.credits.crew.find((p: any) => p.job === 'Director')?.profile_path}`}
                                alt={movieDetails.credits.crew.find((p: any) => p.job === 'Director')?.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'primary.light',
                                  color: 'primary.contrastText',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                }}
                              >
                                {getInitials(movieDetails.credits.crew.find((p: any) => p.job === 'Director')?.name || '')}
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography 
                              variant="caption" 
                              fontWeight={500} 
                              noWrap
                              sx={{ display: 'block' }}
                            >
                              {movieDetails.credits.crew.find((p: any) => p.job === 'Director')?.name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: 'block',
                                fontSize: '0.7rem',
                              }}
                            >
                              Director
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Cast Section */}
                    {movieDetails.credits?.cast?.length > 0 && (
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="text.primary"
                          fontWeight={600}
                          mb={1}
                        >
                          Cast
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          {movieDetails.credits.cast.slice(0, 3).map((person: any) => (
                            <Box 
                              key={person.id} 
                              display="flex" 
                              alignItems="center" 
                              gap={1}
                              onMouseEnter={(e) => {
                                if (person.profile_path) {
                                  handlePopoverOpen(e, `https://image.tmdb.org/t/p/w500${person.profile_path}`, person.name);
                                }
                              }}
                              onMouseLeave={handlePopoverClose}
                              sx={{ cursor: 'pointer' }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  bgcolor: 'background.paper',
                                  flexShrink: 0,
                                  boxShadow: 1,
                                }}
                              >
                                {person.profile_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                                    alt={person.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: 'primary.light',
                                      color: 'primary.contrastText',
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {getInitials(person.name)}
                                  </Box>
                                )}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography 
                                  variant="caption" 
                                  fontWeight={500} 
                                  noWrap
                                  sx={{ display: 'block' }}
                                >
                                  {person.name}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  noWrap
                                  sx={{ 
                                    display: 'block',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  {person.character || 'Actor'}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Container>
          </Box>
        ) : null}
        
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 3,
            p: { xs: 3, md: 4 },
            color: 'text.primary'
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
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </Box>
          ) : searchResults.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                {totalResults} results for "{query}"
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)', 
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(5, 1fr)'
                }, 
                gap: 3 
              }}>
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MovieCard 
                      movie={{
                        ...result,
                        id: result.id,
                        title: (result.title || result.name || 'Unknown Title') as string,
                        poster_path: result.poster_path || null,
                        vote_average: result.vote_average || 0,
                        release_date: result.release_date || result.first_air_date || '',
                        overview: result.overview || '',
                        media_type: result.media_type || 'movie',
                        backdrop_path: result.backdrop_path || null,
                        genre_ids: result.genre_ids || [],
                        original_language: result.original_language || '',
                        popularity: result.popularity || 0,
                        vote_count: result.vote_count || 0,
                        video: result.video || false,
                        adult: result.adult || false,
                        original_title: result.original_title || result.title || '',
                        original_name: result.original_name || result.name || '',
                        first_air_date: result.first_air_date || '',
                        origin_country: result.origin_country || [],
                        name: result.name || result.title || ''
                      } as ExtendedMovie}
                      showRating={isAuthenticated}
                      onRated={refreshRatings}
                      // @ts-ignore - We know these props exist on our custom type
                      onRate={handleRateMovie}
                      // @ts-ignore - We know these props exist on our custom type
                      onStatusChange={handleStatusChange}
                    />
                  </motion.div>
                ))}
              </Box>
              <Box mt={6}>
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                  Recommendations
                </Typography>
                {Object.values(recommendations).map(renderRecommendationSection)}
              </Box>
            </Box>
          ) : query ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <FaSadTear className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                We couldn't find any movies matching "{query}".
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
      {showTrailer && trailerUrl && (
        <Box
          onClick={() => setShowTrailer(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400,
            p: 2,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              maxHeight: '90vh',
            }}
          >
            <Box
              component="button"
              onClick={() => setShowTrailer(false)}
              sx={{
                position: 'absolute',
                top: -40,
                right: 0,
                color: 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                '&:hover': {
                  color: 'grey.400',
                },
              }}
            >
              <FaTimes size={24} />
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 aspect ratio
                height: 0,
                overflow: 'hidden',
                borderRadius: 1,
                '& iframe': {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                },
              }}
            >
              <iframe
                src={trailerUrl}
                title={`${movieDetails?.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Box>
        </Box>
      )}
      <Popover
        sx={{
          pointerEvents: 'none',
          '& .MuiPopover-paper': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
          },
        }}
        open={openPopover}
        anchorEl={popoverAnchor}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        TransitionComponent={Fade}
        transitionDuration={200}
      >
        {popoverImage && (
          <Box 
            sx={{ 
              position: 'relative', 
              ml: 2,
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.1)',
                pointerEvents: 'none',
              }
            }}
          >
            <Box
              component="img"
              src={popoverImage}
              alt={popoverName}
              sx={{
                width: 220,
                height: 220,
                borderRadius: 1,
                objectFit: 'cover',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                display: 'block',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.75)',
                color: 'white',
                p: 1,
                textAlign: 'center',
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                transition: 'opacity 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.85)',
                },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>{popoverName}</Typography>
            </Box>
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default SearchResults;
