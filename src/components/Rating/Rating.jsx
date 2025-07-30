import { useState, useEffect } from 'react';
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
    md: 'text-lg',
    lg: 'text-2xl'
  };

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = async (ratingValue) => {
    if (!isAuthenticated) {
      toast('Please sign in to rate movies', {
        icon: '🔒',
        duration: 3000,
      });
      return;
    }
    
    try {
      // Optimistic UI update
      const previousRating = rating;
      setRating(ratingValue);
      
      if (onRate) {
        await onRate(movieId, ratingValue);
        toast.success('Rating saved!', {
          duration: 2000,
        });
      }
    } catch (error) {
      // Revert on error
      setRating(previousRating);
      toast.error('Failed to save rating. Please try again.');
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <input
              type="radio"
              name={`rating-${movieId}`}
              value={ratingValue}
              onClick={() => handleClick(ratingValue)}
              className="hidden"
            />
            <FaStar
              className={`${sizes[size]} ${
                ratingValue <= (hover || rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default Rating;
