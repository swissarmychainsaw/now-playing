import { useState, useCallback, useEffect, useMemo } from 'react';
import { FaStar, FaRegHeart, FaSpinner, FaFilm, FaCalendarAlt, FaArrowRight, FaBookmark, FaTimesCircle } from 'react-icons/fa';
import { useRatings } from '../../context/RatingsContext';
import { useMovieRating } from '../../hooks/useMovieRating';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// MovieCard component defined outside to properly use hooks
const MovieCard = ({ movie, navigate, ratingInProgress, rateMovie, renderRatingStars, getRatedDate, onMovieRated }) => {
  const [imageError, setImageError] = useState(false);
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
      onClick={() => navigate(`/movie/${movie.movieId || movie.id}`)}
    >
      <div className="aspect-[2/3] bg-gray-100 relative">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4 text-center">
            <FaFilm className="text-gray-300 text-4xl mb-2" />
            <span className="text-sm text-gray-500">No poster available</span>
            <span className="text-xs text-gray-400 mt-2 line-clamp-2 px-2">{movie.title}</span>
          </div>
        )}
      
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white font-medium text-sm line-clamp-1">{movie.title}</h3>
          <div className="flex justify-between items-center mt-1">
            {movie.rating !== null ? (
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" size={14} />
                <span className="text-white text-xs font-medium">
                  {movie.rating.toFixed(1)}
                </span>
              </div>
            ) : (
              <div className="h-4" />
            )}
            {movie.release_date && (
              <div className="flex items-center text-white/80 text-xs">
                <FaCalendarAlt className="mr-1" size={10} />
                {new Date(movie.release_date).getFullYear()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{movie.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
              {movie.rating !== null && (
                <>
                  <span className="mx-2">•</span>
                  <span>Rated {movie.rating.toFixed(1)}/5</span>
                </>
              )}
            </div>
          </div>
          {movie.rating !== null && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {Math.round(movie.rating * 10) / 10}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          {renderRatingStars(movie)}
        </div>
        
        {movie.ratedAt && (
          <div className="mt-2 text-xs text-gray-400">
            Rated on {getRatedDate(movie)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RatingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const { getMoviesByRating, getRatedMovies, getMoviesByStatus, loading, clearAllRatings } = useRatings();
  const { rateMovie: originalRateMovie, isRating: ratingInProgress } = useMovieRating();
  
  // Wrap the rateMovie function to handle the onSuccess callback
  const rateMovie = useCallback((movieId, rating, movieData) => {
    return originalRateMovie(movieId, rating, movieData, () => {
      // Force a re-render to show the updated movie list
      setRefreshKey(prev => prev + 1);
    });
  }, [originalRateMovie]);
  
  // Get all rated movies and filter by tab and status
  // Use refreshKey to force re-evaluation when ratings change
  const allRatedMovies = getRatedMovies();
  const lovedMovies = getMoviesByRating(5, 5);
  const likedMovies = getMoviesByRating(4, 4);
  const neutralMovies = getMoviesByRating(3, 3);
  const dislikedMovies = getMoviesByRating(1, 2);
  const notInterestedMovies = getMoviesByStatus('not_interested');
  const watchlistMovies = getMoviesByStatus('want_to_watch');
  const ratedMovies = allRatedMovies.filter(movie => movie.status === 'rated');
  // This effect is just to use the refreshKey to force re-renders
  useEffect(() => {}, [refreshKey]);
  
  // Get the date when the movie was rated
  const getRatedDate = useCallback((movie) => {
    if (!movie.ratedAt) return 'Unknown date';
    const date = movie.ratedAt.toDate ? movie.ratedAt.toDate() : new Date(movie.ratedAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  // Get movies to show based on active tab
  const getMoviesToShow = useCallback(() => {
    console.log('Refreshing movies with refreshKey:', refreshKey);
    
    // Force re-evaluation of the movies by accessing the functions
    const currentAllRatedMovies = getRatedMovies();
    const currentLovedMovies = getMoviesByRating(5, 5);
    const currentLikedMovies = getMoviesByRating(4, 4);
    const currentNeutralMovies = getMoviesByRating(3, 3);
    const currentDislikedMovies = getMoviesByRating(1, 2);
    const currentNotInterestedMovies = getMoviesByStatus('not_interested');
    const currentWatchlistMovies = getMoviesByStatus('want_to_watch');
    
    switch (activeTab) {
      case 'loved':
        return currentLovedMovies;
      case 'liked':
        return currentLikedMovies;
      case 'neutral':
        return currentNeutralMovies;
      case 'disliked':
        return currentDislikedMovies;
      case 'not_interested':
        return currentNotInterestedMovies;
      case 'watchlist':
        return currentWatchlistMovies;
      default:
        return currentAllRatedMovies.filter(movie => movie.status !== 'not_interested' && movie.status !== 'want_to_watch');
    }
  }, [activeTab, refreshKey, getRatedMovies, getMoviesByRating, getMoviesByStatus]);
  
  const moviesToShow = getMoviesToShow();
  
  // Sort movies by rating (highest first) and then by title
  const sortedMovies = useMemo(() => {
    console.log('Sorting movies with refreshKey:', refreshKey);
    return [...moviesToShow].sort((a, b) => {
      // First sort by rating (highest first)
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      
      // Then sort by title (handle cases where title might be missing)
      const titleA = String(a.title || '').toLowerCase();
      const titleB = String(b.title || '').toLowerCase();
      return titleA.localeCompare(titleB);
    });
  }, [moviesToShow, refreshKey]);

  const renderEmptyState = useCallback(() => {
    const messages = {
      all: "You haven't rated any movies yet.",
      loved: "You haven't given any movies 5 stars yet.",
      liked: "You haven't given any movies 4 stars yet.",
      neutral: "You haven't given any movies 3 stars yet.",
      disliked: "You haven't given any movies 1-2 stars yet."
    };
    
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FaStar className="text-gray-400 text-2xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Ratings Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {messages[activeTab] || messages.all}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Browse Movies
          <FaArrowRight className="ml-2 -mr-1 h-4 w-4" />
        </button>
      </div>
    );
  }, [activeTab, navigate]);
  
  const renderLoadingState = () => (
    <div className="flex justify-center items-center py-12">
      <FaSpinner className="animate-spin text-primary text-2xl mr-3" />
      <span className="text-gray-600">Loading your ratings...</span>
    </div>
  );

  const renderRatingStars = useCallback((movie) => {
    // Get the movie ID, ensuring we have a valid value
    // If we only have rating data, use a fallback ID
    const movieId = movie.movieId || movie.id || 'unknown';
    
    // Get the rating, defaulting to 0 if not provided
    const rating = movie.rating || 0;

    return (
      <div className="flex items-center" role="radiogroup" aria-label="Movie rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= rating;
          return (
            <button
              key={`star-${movieId}-${star}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (ratingInProgress) return;
                rateMovie(
                  movieId, 
                  movie.rating === star ? 0 : star, // Toggle if clicking the same star
                  movie
                );
              }}
              disabled={ratingInProgress}
              className={
                ratingInProgress 
                  ? 'p-0.5 cursor-wait' 
                  : 'p-0.5 cursor-pointer'
              }
              aria-label={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
              aria-pressed={isSelected}
              aria-checked={isSelected}
              role="radio"
            >
              <FaStar 
                className={
                  isSelected 
                    ? (ratingInProgress ? 'text-yellow-400 opacity-70' : 'text-yellow-400')
                    : (ratingInProgress ? 'text-gray-300 opacity-70' : 'text-gray-300')
                }
                size={16}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    );
  }, [rateMovie, ratingInProgress]);

  if (loading && allRatedMovies.length === 0) {
    return renderLoadingState();
  }

  if (allRatedMovies.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Fixed header with overlay */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Ratings</h1>
              <p className="text-sm text-gray-500">
                {allRatedMovies.length} movie{allRatedMovies.length !== 1 ? 's' : ''} rated
              </p>
            </div>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to clear all your ratings? This action cannot be undone.')) {
                  const success = await clearAllRatings();
                  if (success) {
                    toast.success('All ratings cleared successfully');
                  } else {
                    toast.error('Failed to clear ratings');
                  }
                }
              }}
              disabled={loading || allRatedMovies.length === 0}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Clearing...' : 'Clear All Ratings'}
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-1 -mb-px">
            {[
              { id: 'all', label: 'All', count: ratedMovies.length },
              { id: 'loved', label: 'Loved', count: lovedMovies.length, icon: <FaStar className="text-yellow-400" />, description: '5 stars' },
              { id: 'liked', label: 'Liked', count: likedMovies.length, icon: <FaStar className="text-blue-400" />, description: '4 stars' },
              { id: 'neutral', label: 'Neutral', count: neutralMovies.length, icon: <FaStar className="text-gray-400" />, description: '3 stars' },
              { id: 'disliked', label: 'Disliked', count: dislikedMovies.length, icon: <FaStar className="text-red-400" />, description: '1-2 stars' },
              { id: 'watchlist', label: 'Watchlist', count: watchlistMovies.length, icon: <FaBookmark className="text-blue-400" /> },
              { id: 'not_interested', label: 'Not Interested', count: notInterestedMovies.length, icon: <FaTimesCircle className="text-red-400" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg flex flex-col items-center ${
                  activeTab === tab.id
                    ? 'bg-white text-primary border-t-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  {tab.icon && <span className="mr-1">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-gray-100 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </div>
                {tab.description && (
                  <span className="text-xs mt-1 text-gray-500">{tab.description}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          renderLoadingState()
        ) : sortedMovies.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedMovies.map((movie) => (
              <MovieCard
                key={movie.movieId || movie.id}
                movie={movie}
                navigate={navigate}
                ratingInProgress={ratingInProgress}
                rateMovie={rateMovie}
                renderRatingStars={renderRatingStars}
                getRatedDate={getRatedDate}
                onRated={() => {
                  // Force a re-render to show the updated movie list
                  setRefreshKey(prev => prev + 1);
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RatingsPage;
