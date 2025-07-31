import { useState, useCallback } from 'react';
import { saveRating, removeRating } from '../services/ratings';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle movie rating functionality
 * @returns {Object} - Rating functions and state
 */
export const useMovieRating = () => {
  const { user } = useAuth();
  const [isRating, setIsRating] = useState(false);

  /**
   * Rate a movie
   * @param {string} movieId - The ID of the movie to rate
   * @param {number} rating - The rating value (1-5, or -1 for not interested, -2 for watchlist)
   * @param {Object} movieData - Additional movie data to store with the rating
   * @param {Function} onSuccess - Callback function called after successful rating
   */
  const rateMovie = useCallback(async (movieId, rating, movieData = {}, onSuccess) => {
    if (!user) {
      toast.error('Please sign in to rate movies');
      return false;
    }

    if (!movieId) {
      console.error('Missing movieId for rateMovie');
      return false;
    }

    // If rating is not provided, default to 0 (unrate)
    const newRating = rating !== undefined ? Number(rating) : 0;

    // Special status values
    const statusMessages = {
      '-2': 'Added to watchlist',
      '-1': 'Marked as not interested',
      '0': 'Rating removed',
      '1': 'Rated 1 star',
      '2': 'Rated 2 stars',
      '3': 'Rated 3 stars',
      '4': 'Rated 4 stars',
      '5': 'Rated 5 stars',
    };

    setIsRating(true);
    try {
      // For special statuses or regular ratings, use saveRating
      await saveRating(user.uid, movieId, newRating, {
        ...movieData,
        title: movieData.title || 'Untitled Movie',
        poster_path: movieData.poster_path || null,
        release_date: movieData.release_date || null,
      });

      // Show appropriate success message
      const message = statusMessages[newRating] || 'Rating saved';
      toast.success(message);
      
      // Call onSuccess callback if provided
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      return true;
    } catch (error) {
      console.error('Error rating movie:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to save rating. Please try again.';
      if (error.message.includes('Invalid rating value')) {
        errorMessage = 'Invalid rating value. Please try again.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsRating(false);
    }
  }, [user]);

  /**
   * Toggle a movie's rating between liked (5) and not rated (0)
   * @param {string} movieId - The ID of the movie to toggle
   * @param {Object} movieData - Additional movie data
   * @param {number} currentRating - The current rating (if any)
   */
  const toggleLike = useCallback(async (movieId, movieData = {}, currentRating = 0, onSuccess) => {
    // If already liked, remove the rating
    if (currentRating >= 4) {
      return rateMovie(movieId, 0, movieData, onSuccess);
    }
    // Otherwise, set to 5 stars (liked)
    return rateMovie(movieId, 5, movieData, onSuccess);
  }, [rateMovie]);

  /**
   * Toggle a movie's rating between disliked (1) and not rated (0)
   * @param {string} movieId - The ID of the movie to toggle
   * @param {Object} movieData - Additional movie data
   * @param {number} currentRating - The current rating (if any)
   */
  const toggleDislike = useCallback(async (movieId, movieData = {}, currentRating = 0, onSuccess) => {
    // If already disliked, remove the rating
    if (currentRating > 0 && currentRating <= 2) {
      return rateMovie(movieId, 0, movieData, onSuccess);
    }
    // Otherwise, set to 1 star (disliked)
    return rateMovie(movieId, 1, movieData, onSuccess);
  }, [rateMovie]);

  return {
    rateMovie,
    toggleLike,
    toggleDislike,
    isRating,
  };
};

export default useMovieRating;
