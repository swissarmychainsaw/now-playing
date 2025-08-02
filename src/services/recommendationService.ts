import tmdbService from './tmdb';
import { TmdbMovie, TmdbCredits, TmdbMovieDetails } from '../types/tmdb';

// Configuration - weights for different recommendation factors
const WEIGHTS = {
  // Content-based weights
  DIRECTOR: 0.15,
  OSCAR_WINNING_DIRECTOR_BOOST: 0.1,
  ACTOR_1: 0.2,
  ACTOR_2: 0.15,
  ACTOR_3: 0.1,
  GENRE_TONE: 0.4,
  OSCAR_WINNING_MOVIE_BOOST: 0.15,
  RATING_WEIGHT: 0.25,
  
  // Collaborative filtering
  COLLABORATIVE: 0.4,
  
  // User preferences
  WATCHLIST_BOOST: 0.1,
  RECENCY_PENALTY: -0.1
};

// Cache for recommendations with TTL (5 minutes)
const recommendationCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface UserData {
  userId?: string;
  ratings?: Array<{ movieId: number; rating: number }>;
  watchlist?: number[];
  notInterested?: number[];
}

interface ScoredMovie extends TmdbMovie {
  _score: number;
  _matches?: Array<{ type: string; name: string; score: number }>;
}

/**
 * Get hybrid recommendations for a movie
 */
export const getHybridRecommendations = async (
  movieId: number, 
  userData: UserData = {}
): Promise<ScoredMovie[]> => {
  const cacheKey = `${movieId}-${userData.userId || 'anon'}`;
  
  // Check cache first
  const cached = recommendationCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  try {
    // 1. Get TMDB's base recommendations
    const { results: tmdbRecs } = await tmdbService.getMovieRecommendations(movieId);
    
    // 2. Get detailed movie data for scoring
    const moviesWithScores = await Promise.all(
      tmdbRecs.slice(0, 20).map(async (movie: TmdbMovie) => {
        try {
          const details = await tmdbService.getMovieDetails(movie.id);
          const credits = await tmdbService.getMovieCredits(movie.id);
          const score = await calculateMovieScore(movie, { ...details, credits }, userData);
          return { ...movie, _score: score } as ScoredMovie;
        } catch (error) {
          console.error(`Error processing movie ${movie.id}:`, error);
          return { ...movie, _score: 0 } as ScoredMovie;
        }
      })
    );

    // 3. Filter out movies with 0 score and sort by score
    const recommendations = moviesWithScores
      .filter(movie => movie._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 5); // Return top 5

    // Cache the results
    recommendationCache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error getting hybrid recommendations:', error);
    // Fallback to popular movies
    return getFallbackRecommendations();
  }
};

/**
 * Calculate a score for a movie based on various factors
 */
const calculateMovieScore = async (
  movie: TmdbMovie,
  details: TmdbMovieDetails & { credits?: TmdbCredits },
  userData: UserData
): Promise<number> => {
  let score = 0;
  const matches: Array<{ type: string; name: string; score: number }> = [];

  // 1. Director matching
  if (details.credits?.crew) {
    const director = details.credits.crew.find(c => c.job === 'Director');
    if (director) {
      const directorScore = WEIGHTS.DIRECTOR;
      score += directorScore;
      matches.push({
        type: 'director',
        name: director.name,
        score: directorScore
      });

      // Check for Oscar-winning director (simplified)
      if (director.name.toLowerCase().includes('nolan') || 
          director.name.toLowerCase().includes('spielberg')) {
        score += WEIGHTS.OSCAR_WINNING_DIRECTOR_BOOST;
        matches.push({
          type: 'award',
          name: 'Oscar Winning Director',
          score: WEIGHTS.OSCAR_WINNING_DIRECTOR_BOOST
        });
      }
    }
  }

  // 2. Actor matching
  if (details.credits?.cast) {
    const topActors = details.credits.cast.slice(0, 3);
    const actorWeights = [WEIGHTS.ACTOR_1, WEIGHTS.ACTOR_2, WEIGHTS.ACTOR_3];
    
    topActors.forEach((actor, index) => {
      if (index < actorWeights.length) {
        score += actorWeights[index];
        matches.push({
          type: 'actor',
          name: actor.name,
          score: actorWeights[index]
        });
      }
    });
  }

  // 3. Genre matching
  if (details.genres?.length) {
    const genreScore = (details.genres.length / 3) * WEIGHTS.GENRE_TONE;
    score += genreScore;
    matches.push({
      type: 'genre',
      name: details.genres.map(g => g.name).join(', '),
      score: genreScore
    });
  }

  // 4. Rating-based weighting
  if (movie.vote_average) {
    const ratingScore = (movie.vote_average / 10) * WEIGHTS.RATING_WEIGHT;
    score += ratingScore;
    matches.push({
      type: 'rating',
      name: `Rating: ${movie.vote_average}`,
      score: ratingScore
    });
  }

  // 5. Collaborative filtering (if enough user data)
  if (userData.ratings && userData.ratings.length >= 5) {
    const collabScore = calculateCollaborativeScore(movie, userData);
    score += collabScore * WEIGHTS.COLLABORATIVE;
    
    if (collabScore > 0) {
      matches.push({
        type: 'personalized',
        name: 'Based on your ratings',
        score: collabScore * WEIGHTS.COLLABORATIVE
      });
    }
  }

  // 6. Watchlist boost
  if (userData.watchlist?.includes(movie.id)) {
    score += WEIGHTS.WATCHLIST_BOOST;
    matches.push({
      type: 'watchlist',
      name: 'In your watchlist',
      score: WEIGHTS.WATCHLIST_BOOST
    });
  }

  // 7. Apply penalties
  if (userData.notInterested?.includes(movie.id)) {
    return 0; // Skip movies marked as not interested
  }

  // Ensure score is between 0 and 1
  return Math.min(1, Math.max(0, score));
};

/**
 * Simple collaborative filtering based on user ratings
 */
const calculateCollaborativeScore = (
  movie: TmdbMovie,
  userData: UserData
): number => {
  if (!userData.ratings?.length) return 0;

  // This is a simplified version - in a real app, you'd use a more sophisticated algorithm
  const similarMovies = userData.ratings
    .filter(rating => rating.rating >= 4) // Only consider highly rated movies
    .map(rating => rating.movieId);

  // If the movie is similar to highly rated movies, increase its score
  const similarityScore = similarMovies.includes(movie.id) ? 0.8 : 0;
  
  return similarityScore;
};

/**
 * Fallback to popular movies if recommendations fail
 */
const getFallbackRecommendations = async (): Promise<ScoredMovie[]> => {
  try {
    const { results } = await tmdbService.getPopularMovies();
    return results.slice(0, 5).map(movie => ({
      ...movie,
      _score: 0.5, // Default score for fallback
      _matches: [{ type: 'fallback', name: 'Popular Movie', score: 0.5 }]
    } as ScoredMovie));
  } catch (error) {
    console.error('Error getting fallback recommendations:', error);
    return [];
  }
};

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of recommendationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      recommendationCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Check every hour
