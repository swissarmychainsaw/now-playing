import { useState, useEffect, useCallback } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useUser } from '../../context/UserContext';

const Rating = ({ movieId, initialRating = 0, onRate, size = 'md' }) => {
  const [hover, setHover] = useState(null);
  const [rating, setRating] = useState(initialRating);
  const { isAuthenticated } = useUser();
  
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = useCallback(async (ratingValue) => {
    if (!isAuthenticated) {
      toast('Please sign in to rate movies', {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }
    
    try {
      // Don't update if clicking the same rating (allow clearing rating)
      const newRating = rating === ratingValue ? 0 : ratingValue;
      setRating(newRating);
      
      if (onRate) {
        await onRate(movieId, newRating);
        toast.success('Rating saved!', {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      toast.error('Failed to save rating. Please try again.');
    }
  }, [movieId, onRate, isAuthenticated, rating]);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((ratingValue) => (
        <button
          key={ratingValue}
          type="button"
          className={`${sizes[size]} p-0.5 focus:outline-none ${
            ratingValue <= (hover || rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => handleClick(ratingValue)}
          onMouseEnter={() => setHover(ratingValue)}
          onMouseLeave={() => setHover(null)}
          aria-label={`Rate ${ratingValue} out of 5`}
        >
          <FaStar className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

export default Rating;
