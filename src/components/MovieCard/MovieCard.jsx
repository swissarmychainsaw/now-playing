import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar, FaFilm } from 'react-icons/fa';
import { useRatings } from '../../context/RatingsContext';
import { useMovieRating } from '../../hooks/useMovieRating';
import { Link } from 'react-router-dom';

/**
 * MovieCard Component
 * 
 * Displays a movie poster with hover effects, rating functionality, and navigation to the movie detail page.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.movie - The movie object containing movie details
 * @param {boolean} [props.showRating=true] - Whether to show the rating stars
 * @param {boolean} [props.showTitle=true] - Whether to show the movie title
 * @param {boolean} [props.showYear=true] - Whether to show the release year
 * @param {string} [props.size='default'] - Size variant: 'default', 'small', or 'large'
 * @param {function} [props.onRated] - Callback function when a rating is submitted
 * @returns {JSX.Element} Rendered MovieCard component
 */

const MovieCard = ({ 
  movie, 
  showRating = true, 
  showTitle = true, 
  showYear = true,
  size = 'default',
  onRated,
  onRate,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const { getMovieRating } = useRatings();
  const { rateMovie, isRating } = useMovieRating();
  
  // Get the current rating for this movie from the context
  const currentRating = getMovieRating(movie.id)?.rating || 0;
  
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localRating, setLocalRating] = useState(currentRating);
  const [isRatingLocal, setIsRatingLocal] = useState(false);
  const [director, setDirector] = useState(null);
  
  // Update local rating when currentRating changes from the context
  useEffect(() => {
    setLocalRating(currentRating);
  }, [currentRating]);

  // Fetch director information when movie changes
  useEffect(() => {
    const fetchDirector = async () => {
      try {
        if (movie.credits?.crew) {
          const director = movie.credits.crew.find(
            member => member.job === 'Director' || member.department === 'Directing'
          );
          setDirector(director || null);
        } else if (movie.id) {
          // If credits.crew isn't available, fetch it
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
          );
          if (response.ok) {
            const credits = await response.json();
            const director = credits.crew?.find(
              member => member.job === 'Director' || member.department === 'Directing'
            );
            setDirector(director || null);
          }
        }
      } catch (error) {
        console.error('Error fetching director:', error);
      }
    };

    fetchDirector();
  }, [movie]);
  
  // Size variants
  const sizeClasses = {
    small: {
      container: 'w-32',
      title: 'text-sm',
      year: 'text-xs',
      rating: 'text-xs',
    },
    default: {
      container: 'w-48',
      title: 'text-base',
      year: 'text-sm',
      rating: 'text-sm',
    },
    large: {
      container: 'w-64',
      title: 'text-lg',
      year: 'text-base',
      rating: 'text-base',
    },
  };
  
  const sizeConfig = sizeClasses[size] || sizeClasses.default;
  
  /**
   * Handles clicks on the movie card
   * 
   * Navigates to the movie detail page when the card is clicked, unless the click
   * was on a rating star or a like button.
   * 
   * @param {Event} e - The click event
   */
  const handleCardClick = useCallback((e) => {
    // Check if the click was on a rating star, like button, or their children
    const interactiveElements = [
      e.target.closest('.rating-stars, .rating-stars *'),
      e.target.closest('.like-button, .like-button *'),
    ];
    
    // Only navigate if the click wasn't on an interactive element
    if (!interactiveElements.some(el => el)) {
      // Try to get the movie ID from different possible properties
      const movieId = movie.id || movie.movieId;
      if (!movieId) {
        console.error('Cannot navigate: No valid movie ID found', movie);
        return;
      }
      navigate(`/movie/${movieId}`);
    }
  }, [movie, navigate]);

  // Handle like button click
  const handleLikeClick = async (e) => {
    e.stopPropagation();
    const movieId = movie.id || movie.movieId;
    if (!movieId) {
      console.error('Cannot rate: No valid movie ID found', movie);
      return;
    }
    
    setIsRatingLocal(true);
    const newRating = currentRating >= 4 ? 0 : 5; // Toggle between 5 stars and 0
    
    try {
      await rateMovie(movieId, newRating, {
        id: movieId,
        movieId: movieId,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
      });
      
      // Update local state
      setLocalRating(newRating);
      
      // Call the appropriate callbacks
      if (onRated) {
        onRated();
      }
      
      if (onRate) {
        await onRate(movieId, newRating, movie);
      }
      
      if (onStatusChange) {
        await onStatusChange(movieId, newRating, movie);
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    } finally {
      setIsRatingLocal(false);
    }
  };
  


  // Check if we should show the placeholder
  const showPlaceholder = !movie.poster_path;

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = '/placeholder-movie.png';
    setImageLoaded(true);
  };
  
  // Preload image
  useEffect(() => {
    if (showPlaceholder) {
      setImageLoaded(true);
      return;
    }

    setImageLoaded(false);
    const img = new Image();
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    
    img.onload = () => {
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      setImageLoaded(true);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [movie.poster_path, showPlaceholder]);
  
  // Get the release year
  const getReleaseYear = () => {
    if (movie.release_date) {
      return new Date(movie.release_date).getFullYear();
    }
    return null;
  };

  return (
    <div 
      className={`group relative cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-lg rounded-lg overflow-hidden bg-white ${sizeConfig.container}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${movie.title}${getReleaseYear() ? ` (${getReleaseYear()})` : ''}`}
    >
      {/* Movie Poster */}
      <div className="aspect-[2/3] bg-gray-100 overflow-hidden relative">
        {!showPlaceholder && !imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        
        {showPlaceholder ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image Available</span>
          </div>
        ) : (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title || 'Movie poster'}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Like Button */}
        <button
          className={`absolute top-2 right-2 p-2 rounded-full transition-opacity z-10 ${
            isHovered || currentRating >= 4 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } ${
            isRating || isRatingLocal 
              ? 'bg-gray-400 cursor-wait' 
              : 'bg-black/70 hover:bg-primary cursor-pointer'
          }`}
          onClick={handleLikeClick}
          disabled={isRating || isRatingLocal}
          aria-label={currentRating >= 4 ? 'Remove like' : 'Like this movie'}
        >
          {isRating || isRatingLocal ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : currentRating >= 4 ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-white" />
          )}
        </button>
        
        {/* Hover Overlay - Show only movie details */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="mt-auto">
            <h3 className="font-medium text-white text-sm truncate">
              {movie.title}
            </h3>
            {director && (
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <FaFilm className="mr-1 text-blue-400" size={10} />
                <Link 
                  to={`/director/${director.id}`}
                  className="hover:text-blue-400 transition-colors truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {director.name}
                </Link>
              </div>
            )}
            {movie.vote_average > 0 && (
              <div className="flex items-center mt-1">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-white text-xs">
                  {movie.vote_average.toFixed(1)}
                  {movie.vote_count > 0 && (
                    <span className="text-gray-400 ml-1">
                      ({movie.vote_count.toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
            )}
            {showYear && movie.release_date && !director && (
              <p className="text-gray-400 text-xs mt-1">
                {new Date(movie.release_date).getFullYear()}
              </p>
            )}
            
            {movie.overview && (
              <p className="text-gray-200 text-sm line-clamp-3 mb-2">
                {movie.overview}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Movie Info (visible by default) */}
      <div className="p-3">
        {showTitle && (
          <h3 className={`font-medium text-gray-900 line-clamp-1 ${sizeConfig.title}`}>
            {movie.title}
          </h3>
        )}
        
        <div className="mt-1">
          <div className="flex items-center">
            {showYear && getReleaseYear() && (
              <p className={`text-gray-500 ${sizeConfig.year}`}>
                {getReleaseYear()}
                {movie.is_oscar_winner && (
                  <span className="ml-1.5 text-amber-500" title="Oscar Winner">🏆</span>
                )}
              </p>
            )}
            
            {showRating && (
              <div className="flex items-center ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isRating || isRatingLocal) return;
                      
                      const movieId = movie.id || movie.movieId;
                      if (!movieId) {
                        console.error('Cannot rate: No valid movie ID found', movie);
                        return;
                      }
                      
                      setIsRatingLocal(true);
                      const newRating = localRating === star ? 0 : star; // Toggle if clicking same star
                      setLocalRating(newRating);
                      
                      try {
                        await rateMovie(movieId, newRating, {
                          id: movieId,
                          movieId: movieId,
                          title: movie.title,
                          poster_path: movie.poster_path,
                          release_date: movie.release_date,
                          overview: movie.overview,
                          vote_average: movie.vote_average,
                        });
                        
                        // Call the appropriate callbacks
                        if (onRated) {
                          onRated();
                        }
                        
                        if (onRate) {
                          await onRate(movieId, newRating);
                        }
                      } catch (error) {
                        console.error('Error rating movie:', error);
                        // Revert local state on error
                        setLocalRating(currentRating);
                      } finally {
                        setIsRatingLocal(false);
                      }
                    }}
                    disabled={isRating || isRatingLocal}
                    className={`p-0.5 ${isRating || isRatingLocal ? 'cursor-wait' : 'cursor-pointer'}`}
                    aria-label={`Rate ${star} star`}
                  >
                    <FaStar 
                      className={`${star <= localRating ? 'text-yellow-400' : 'text-gray-200'} ${isRating || isRatingLocal ? 'opacity-70' : ''}`}
                      size={12}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          

          
          {showRating && (
            <div className="mt-1">
              <span className="text-xs text-gray-500">
                {currentRating > 0 
                  ? 'Your rating' 
                  : 'Rate for Recommendations'}
              </span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (isRating || isRatingLocal) return;
                
                const movieId = movie.id || movie.movieId;
                if (!movieId) {
                  console.error('Cannot rate: No valid movie ID found', movie);
                  return;
                }
                
                setIsRatingLocal(true);
                const newStatus = localRating === -1 ? 0 : -1; // Toggle not interested
                setLocalRating(newStatus);
                
                try {
                  await rateMovie(movieId, newStatus, {
                    id: movieId,
                    movieId: movieId,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    release_date: movie.release_date,
                    overview: movie.overview,
                    vote_average: movie.vote_average,
                  });
                  
                  // Call the appropriate callbacks
                  if (onRated) {
                    onRated();
                  }
                  
                  if (onStatusChange) {
                    onStatusChange(movieId, 'not_interested');
                  } else if (onRate) {
                    onRate(movieId, newStatus, movie);
                  }
                } catch (error) {
                  console.error('Error updating movie status:', error);
                  setLocalRating(currentRating);
                } finally {
                  setIsRatingLocal(false);
                }
              }}
              disabled={isRating || isRatingLocal}
              className={`flex items-center text-xs px-2 py-1 rounded ${
                localRating === -1 
                  ? 'bg-red-100 text-red-700 border border-red-300' 
                  : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
              } ${isRating || isRatingLocal ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
              aria-label={localRating === -1 ? 'Interested in this movie' : 'Not interested in this movie'}
              title={localRating === -1 ? 'Click to undo' : 'Not interested'}
            >
              {localRating === -1 ? '✓ Not Interested' : 'Not Interested'}
            </button>
            
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (isRating || isRatingLocal) return;
                
                const movieId = movie.id || movie.movieId;
                if (!movieId) {
                  console.error('Cannot rate: No valid movie ID found', movie);
                  return;
                }
                
                setIsRatingLocal(true);
                const newStatus = localRating === -2 ? 0 : -2; // Toggle want to watch
                setLocalRating(newStatus);
                
                try {
                  await rateMovie(movieId, newStatus, {
                    id: movieId,
                    movieId: movieId,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    release_date: movie.release_date,
                    overview: movie.overview,
                    vote_average: movie.vote_average,
                  });
                  
                  // Call the appropriate callbacks
                  if (onRated) {
                    onRated();
                  }
                  
                  if (onStatusChange) {
                    onStatusChange(movieId, 'watchlist');
                  } else if (onRate) {
                    onRate(movieId, newStatus, movie);
                  }
                } catch (error) {
                  console.error('Error updating movie status:', error);
                  setLocalRating(currentRating);
                } finally {
                  setIsRatingLocal(false);
                }
              }}
              disabled={isRating || isRatingLocal}
              className={`flex items-center text-xs px-2 py-1 rounded ${
                localRating === -2 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
              } ${isRating || isRatingLocal ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
              aria-label={localRating === -2 ? 'Remove from watchlist' : 'Add to watchlist'}
              title={localRating === -2 ? 'Click to remove from watchlist' : 'Add to watchlist'}
            >
              {localRating === -2 ? '✓ Watchlist' : 'Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import PropTypes from 'prop-types';

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    overview: PropTypes.string,
    vote_average: PropTypes.number,
    is_oscar_winner: PropTypes.bool,
  }).isRequired,
  showRating: PropTypes.bool,
  showTitle: PropTypes.bool,
  showYear: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  onRated: PropTypes.func,
  onRate: PropTypes.func,
  onStatusChange: PropTypes.func
};

export default MovieCard;
