import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { onRatingsChange, clearAllRatings as clearAllRatingsService } from '../services/ratings';

const RatingsContext = createContext();

export const RatingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setRatings({});
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener for ratings
    const handleRatingsUpdate = (updatedRatings) => {
      if (updatedRatings && typeof updatedRatings === 'object') {
        setRatings(updatedRatings);
      } else {
        setRatings({});
      }
      setLoading(false);
      setError(null);
    };

    const handleRatingsError = (error) => {
      console.error('Error in ratings listener:', error);
      setError('Failed to load ratings');
      setLoading(false);
      // Don't clear ratings on error to prevent UI flicker
    };

    let unsubscribe;
    try {
      unsubscribe = onRatingsChange(
        user.uid,
        handleRatingsUpdate,
        handleRatingsError
      );
    } catch (error) {
      console.error('Error setting up ratings listener:', error);
      setError('Failed to set up ratings listener');
      setLoading(false);
    }

    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error cleaning up ratings listener:', error);
        }
      }
    };
  }, [user?.uid]); // Only re-run if user.uid changes

  // Get a specific movie's rating
  const getMovieRating = (movieId) => {
    if (!movieId) return null;
    return ratings[movieId] || null;
  };

  // Check if a movie is rated
  const isMovieRated = (movieId) => {
    return !!ratings[movieId];
  };

  // Get all rated movies
  const getRatedMovies = () => {
    return Object.values(ratings);
  };

  // Get movies by rating (e.g., 4-5 stars, 1-2 stars)
  const getMoviesByRating = (minRating = 0, maxRating = 5) => {
    return Object.values(ratings).filter(
      (rating) => rating.rating >= minRating && rating.rating <= maxRating && rating.status === 'rated'
    );
  };
  
  // Get movies by status
  const getMoviesByStatus = (status) => {
    return Object.values(ratings).filter(
      (rating) => rating.status === status
    );
  };

  // Clear all ratings for the current user
  const clearAllRatings = async () => {
    if (!user?.uid) {
      console.error('Cannot clear ratings: No user is signed in');
      return false;
    }

    try {
      await clearAllRatingsService(user.uid);
      // The ratings state will be updated automatically by the onRatingsChange listener
      return true;
    } catch (error) {
      console.error('Failed to clear ratings:', error);
      return false;
    }
  };

  const value = {
    ratings,
    loading,
    error,
    getMovieRating,
    isMovieRated,
    getRatedMovies,
    getMoviesByRating,
    getMoviesByStatus,
    clearAllRatings,
  };

  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
};

// Custom hook to use the ratings context
export const useRatings = () => {
  const context = useContext(RatingsContext);
  if (!context) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
};

export default RatingsContext;
