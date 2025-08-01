import { useState, useEffect, useCallback } from 'react';
import recommendationEngine from '../services/recommendationEngine';
const { getRecommendations } = recommendationEngine;
import { useAuth } from '../context/AuthContext';
import { useRatings } from '../context/RatingsContext';

export function useMovieRecommendations(movieId) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { ratings } = useRatings();

  const fetchRecommendations = useCallback(async (id) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare user data for recommendations
      const userRatings = Object.entries(ratings).map(([movieId, ratingData]) => ({
        movie_id: movieId,
        title: ratingData.title,
        user_rating: ratingData.rating
      }));
      
      const userData = {
        ratings: userRatings,
        // Add watchlist and not_interested when implemented
        watchlist: [],
        not_interested: []
      };
      
      // Get recommendations using our engine
      const recs = await getRecommendations(id, userData);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [ratings, user?.uid]);

  // Refetch function to be called when needed
  const refetch = useCallback(() => {
    if (movieId) {
      fetchRecommendations(movieId);
    }
  }, [movieId, fetchRecommendations]);

  // Fetch recommendations when movieId changes
  useEffect(() => {
    if (movieId) {
      fetchRecommendations(movieId);
    } else {
      setRecommendations([]);
    }
  }, [movieId, fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refetch,
  };
}

export default useMovieRecommendations;
