import { useState, useEffect } from 'react';
import { apiCache } from '../utils/cache';

// Cache configuration
const DETAILS_CACHE_KEY_PREFIX = 'movie-details-';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const useMovieDetails = (movieId) => {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) {
        setMovie(null);
        return;
      }

      const cacheKey = `${DETAILS_CACHE_KEY_PREFIX}${movieId}`;
      const cachedData = apiCache.get(cacheKey);
      
      // Return cached data if available
      if (cachedData) {
        setMovie(cachedData);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) {
          throw new Error('TMDB API key is not configured');
        }

        // Fetch movie details with append_to_response to get videos, similar, and recommendations in one request
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=videos,similar,recommendations,release_dates,watch/providers`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.status_message || `API request failed with status ${response.status}`
          );
        }

        const data = await response.json();
        
        // Process the movie data
        const processedMovie = {
          id: data.id,
          title: data.title,
          originalTitle: data.original_title,
          overview: data.overview,
          posterPath: data.poster_path,
          backdropPath: data.backdrop_path,
          releaseDate: data.release_date,
          runtime: data.runtime,
          tagline: data.tagline,
          voteAverage: data.vote_average,
          voteCount: data.vote_count,
          genres: data.genres || [],
          status: data.status,
          budget: data.budget,
          revenue: data.revenue,
          homepage: data.homepage,
          imdbId: data.imdb_id,
          // Process additional data from append_to_response
          videos: data.videos?.results || [],
          similar: data.similar?.results || [],
          recommendations: data.recommendations?.results || [],
          releaseDates: data.release_dates?.results || [],
          watchProviders: data['watch/providers']?.results || {}
        };

        // Cache the processed movie data
        apiCache.set(cacheKey, processedMovie, CACHE_DURATION);
        setMovie(processedMovie);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError({
          message: err.message || 'Failed to fetch movie details',
          code: err.status_code || 500,
        });
        setMovie(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  // Helper function to get the trailer video
  const getTrailer = () => {
    if (!movie?.videos?.length) return null;
    
    // Try to find an official trailer first
    const officialTrailer = movie.videos.find(
      video => video.official && video.site === 'YouTube' && video.type === 'Trailer'
    );
    
    // If no official trailer, try to find any trailer
    const anyTrailer = movie.videos.find(
      video => video.site === 'YouTube' && video.type === 'Trailer'
    );
    
    // If no trailer, try to find any YouTube video
    const anyVideo = movie.videos.find(
      video => video.site === 'YouTube'
    );
    
    return officialTrailer || anyTrailer || anyVideo || null;
  };

  return {
    movie,
    isLoading,
    error,
    trailer: getTrailer(),
    genres: movie?.genres || [],
    similarMovies: movie?.similar || [],
    recommendedMovies: movie?.recommendations || [],
    watchProviders: movie?.watchProviders || {}
  };
};

export default useMovieDetails;
