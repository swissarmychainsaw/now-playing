import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { onRatingsChange } from '../services/ratings';

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
    const unsubscribe = onRatingsChange(
      user.uid,
      (updatedRatings) => {
        setRatings(updatedRatings || {});
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error in ratings listener:', error);
        setError('Failed to load ratings');
        setLoading(false);
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

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
      (rating) => rating.rating >= minRating && rating.rating <= maxRating
    );
  };

  const value = {
    ratings,
    loading,
    error,
    getMovieRating,
    isMovieRated,
    getRatedMovies,
    getMoviesByRating,
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
