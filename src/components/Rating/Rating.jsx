import { useState, useCallback, useEffect } from 'react';
import { FaStar, FaRegStar, FaSpinner } from 'react-icons/fa';
import { useMovieRating } from '../../hooks/useMovieRating';
import { useRatings } from '../../context/RatingsContext';

const Rating = ({ movieId, movieData = {}, size = 'md', showCount = false }) => {
  const [hover, setHover] = useState(null);
  const { rateMovie, isRating } = useMovieRating();
  const { getMovieRating } = useRatings();
  
  // Get the current rating for this movie
  const currentRating = getMovieRating(movieId)?.rating || 0;
  const [localRating, setLocalRating] = useState(currentRating);
  
  // Update local rating when currentRating changes
  useEffect(() => {
    setLocalRating(currentRating);
  }, [currentRating]);
  
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const handleClick = useCallback(async (e, ratingValue) => {
    // Prevent the click from bubbling up to parent elements
    e.stopPropagation();
    
    // Toggle rating if clicking the same star
    const newRating = localRating === ratingValue ? 0 : ratingValue;
    
    // Update local state immediately for better UX
    setLocalRating(newRating);
    
    // Save to Firestore
    await rateMovie(movieId, newRating, movieData);
  }, [movieId, movieData, rateMovie, localRating]);

  // Show loading spinner when rating is in progress
  if (isRating) {
    return (
      <div className="flex items-center">
        <FaSpinner className="animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Saving...</span>
      </div>
    );
  }

  return (
    <div className="rating-stars flex items-center">
      {[1, 2, 3, 4, 5].map((ratingValue) => {
        const isFilled = ratingValue <= (hover || localRating);
        const StarIcon = isFilled ? FaStar : FaRegStar;
        
        return (
          <button
            key={ratingValue}
            type="button"
            className={`${sizes[size]} p-0.5 focus:outline-none transition-colors ${
              isFilled ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-500`}
            onClick={(e) => handleClick(e, ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(e, ratingValue);
              }
            }}
            aria-label={`Rate ${ratingValue} out of 5`}
            aria-pressed={ratingValue <= localRating}
            disabled={isRating}
          >
            <StarIcon className="w-4 h-4" />
          </button>
        );
      })}
      {showCount && localRating > 0 && (
        <span className="ml-2 text-sm text-gray-500">
          {localRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
