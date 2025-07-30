import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useRatings } from '../../context/RatingsContext';
import { useMovieRating } from '../../hooks/useMovieRating';
import Rating from '../Rating/Rating';

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
 * @returns {JSX.Element} Rendered MovieCard component
 */

const MovieCard = ({ 
  movie, 
  showRating = true, 
  showTitle = true, 
  showYear = true,
  size = 'default' 
}) => {
  const navigate = useNavigate();
  const { getMovieRating } = useRatings();
  const { toggleLike, isRating } = useMovieRating();
  
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Get the current rating for this movie
  const currentRating = getMovieRating(movie.id)?.rating || 0;
  
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
      navigate(`/movie/${movie.id}`);
    }
  }, [movie.id, navigate]);

  // Handle like button click
  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(movie.id, {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      overview: movie.overview,
      vote_average: movie.vote_average,
    }, currentRating);
  };

  // Get the poster URL with fallback
  const getPosterUrl = () => {
    if (movie.poster_path) {
      return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }
    return '/placeholder-movie.png';
  };

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
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={getPosterUrl()}
          alt={movie.title || 'Movie poster'}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = '/placeholder-movie.png';
            setImageLoaded(true);
          }}
          loading="lazy"
        />
        
        {/* Like Button */}
        <button
          className={`absolute top-2 right-2 p-2 bg-black/70 rounded-full text-white transition-opacity ${
            isHovered || currentRating >= 4 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } hover:bg-primary z-10`}
          onClick={handleLikeClick}
          disabled={isRating}
          aria-label={currentRating >= 4 ? 'Remove like' : 'Like this movie'}
        >
          {currentRating >= 4 ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-white" />
          )}
        </button>
        
        {/* Hover Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="mt-auto">
            {showRating && (
              <div className="mb-3">
                <Rating 
                  movieId={movie.id}
                  movieData={{
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    release_date: movie.release_date,
                    overview: movie.overview,
                    vote_average: movie.vote_average,
                  }}
                  size={size === 'small' ? 'sm' : 'md'}
                  showCount={true}
                />
              </div>
            )}
            
            {movie.vote_average > 0 && (
              <div className="flex items-center mb-2">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-white text-sm font-medium">
                  {movie.vote_average.toFixed(1)}
                  {movie.vote_count > 0 && (
                    <span className="text-gray-300 ml-1">
                      ({movie.vote_count.toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
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
        
        {(showYear || movie.vote_average > 0) && (
          <div className="flex items-center justify-between mt-1">
            {showYear && getReleaseYear() && (
              <p className={`text-gray-500 ${sizeConfig.year}`}>
                {getReleaseYear()}
                {movie.is_oscar_winner && (
                  <span className="ml-1.5 text-amber-500" title="Oscar Winner">🏆</span>
                )}
              </p>
            )}
            
            {showRating && currentRating > 0 && (
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1 text-sm" />
                <span className={`text-gray-700 ${sizeConfig.rating}`}>
                  {currentRating.toFixed(1)}/5
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
