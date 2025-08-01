import { useState, useEffect } from 'react';
import { apiCache } from '../utils/cache';

// Cache configuration
const CREDITS_CACHE_KEY_PREFIX = 'credits-';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const useMovieCredits = (movieId) => {
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!movieId) {
        setCredits(null);
        return;
      }

      const cacheKey = `${CREDITS_CACHE_KEY_PREFIX}${movieId}`;
      const cachedData = apiCache.get(cacheKey);
      
      // Return cached data if available
      if (cachedData) {
        setCredits(cachedData);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) {
          throw new Error('TMDB API key is not configured');
        }

        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.status_message || `API request failed with status ${response.status}`
          );
        }

        const data = await response.json();
        
        // Process the credits data
        const processedCredits = {
          id: movieId,
          cast: data.cast.slice(0, 10).map(actor => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profilePath: actor.profile_path,
            order: actor.order
          })),
          crew: data.crew
            .filter(member => 
              ['Director', 'Screenplay', 'Story', 'Writer'].includes(member.job)
            )
            .map(member => ({
              id: member.id,
              name: member.name,
              job: member.job,
              department: member.department,
              profilePath: member.profile_path
            }))
        };

        // Cache the processed credits
        apiCache.set(cacheKey, processedCredits, CACHE_DURATION);
        setCredits(processedCredits);
      } catch (err) {
        console.error('Error fetching movie credits:', err);
        setError({
          message: err.message || 'Failed to fetch movie credits',
          code: err.status_code || 500,
        });
        setCredits(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [movieId]);

  return {
    credits,
    isLoading,
    error,
    director: credits?.crew.find(member => member.job === 'Director'),
    topCast: credits?.cast.slice(0, 5) || []
  };
};

export default useMovieCredits;
