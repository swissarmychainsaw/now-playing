import tmdbService from './tmdb';

const { 
  getMovieDetails, 
  getMovieCredits, 
  getSimilarMovies, 
  searchMovies,
  discoverMovies,
  getRecommendations: getTmdbRecommendations,
  getTrending,
  getMovieGenres
} = tmdbService;

// Configuration for recommendation weights
const WEIGHTS = {
  // Content-based filtering weights
  CONTENT: {
    DIRECTOR: 0.2,          // Increased importance of director
    ACTOR_1: 0.25,          // Increased weight for lead actors
    ACTOR_2: 0.15,
    ACTOR_3: 0.1,
    GENRE: 0.3,             // Genre similarity
    KEYWORDS: 0.1,          // Shared keywords
    VOTE_AVERAGE: 0.05,     // Movie rating
    POPULARITY: 0.03,       // Movie popularity
    RELEASE_DATE: 0.02      // Recency of release
  },
  // Collaborative filtering weights
  COLLABORATIVE: 0.5,       // Increased weight for user preferences
  WATCHLIST_BOOST: 0.1,     // Small boost for watchlisted items
  // Additional factors
  DIVERSITY: 0.1,           // Ensure diverse recommendations
  NOVELTY: 0.05,            // Include some newer/lesser-known movies
  // Penalties
  RECENCY_PENALTY: -0.1,    // Penalty for older movies
  // Minimum scores
  MIN_SIMILARITY: 0.3       // Minimum similarity score to include
};

// Minimum number of rated movies required to use personalized recommendations
const MIN_RATED_MOVIES_FOR_PERSONALIZATION = 5;

// Cache for storing movie details to reduce API calls
const movieCache = new Map();

// Cache expiration time (1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get detailed movie information with enhanced caching and error handling
 */
async function getCachedMovieDetails(movieId) {
  // Check cache first
  if (movieCache.has(movieId)) {
    return movieCache.get(movieId);
  }
  
  try {
    // Get detailed information including keywords, similar movies, and recommendations
    const [details, credits, recommendations, similar] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId),
      getTmdbRecommendations(movieId, { page: 1 }),
      getSimilarMovies(movieId, { page: 1 })
    ]);
    
    // Extract important information
    const director = credits.crew?.find(
      member => member.job === 'Director' || member.department === 'Directing'
    );
    
    const actors = credits.cast?.slice(0, 5).map(actor => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile_path: actor.profile_path
    })) || [];
    
    const movieData = {
      id: details.id,
      title: details.title,
      overview: details.overview,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      release_date: details.release_date,
      vote_average: details.vote_average,
      vote_count: details.vote_count,
      popularity: details.popularity,
      genres: details.genres || [],
      director,
      actors,
      keywords: details.keywords?.keywords || [],
      similarMovies: [...(recommendations.results || []), ...(similar.results || [])]
        .slice(0, 10) // Limit to top 10 similar movies
        .map(movie => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average
        })),
      _fullDetails: true,
      _lastUpdated: Date.now()
    };
    
    // Cache the data
    movieCache.set(movieId, movieData);
    
    // Set cache expiration (1 hour)
    setTimeout(() => {
      movieCache.delete(movieId);
    }, 60 * 60 * 1000);
    
    return movieData;
  } catch (error) {
    console.error(`Error fetching details for movie ${movieId}:`, error);
    // Return a minimal movie object to prevent breaking the UI
    return {
      id: movieId,
      title: `Movie ${movieId}`,
      genres: [],
      actors: [],
      similarMovies: [],
      _fullDetails: false
    };
  }
}

/**
 * Calculate content similarity score between two movies with enhanced matching
 */
const calculateContentSimilarity = (sourceMovie, targetMovie) => {
  let score = 0;
  const matches = [];
  const currentYear = new Date().getFullYear();
  
  // 1. Director match (exact match with higher weight)
  if (sourceMovie.director?.id && targetMovie.director?.id && 
      sourceMovie.director.id === targetMovie.director.id) {
    const matchScore = WEIGHTS.CONTENT.DIRECTOR;
    score += matchScore;
    matches.push({
      type: 'director',
      name: sourceMovie.director.name,
      score: matchScore.toFixed(2)
    });
  }
  
  // 2. Actor matches (with position-based weights and character importance)
  const sourceActors = sourceMovie.actors || [];
  const targetActors = targetMovie.actors || [];
  const sourceActorIds = sourceActors.map(a => a.id);
  
  targetActors.forEach((actor, index) => {
    if (sourceActorIds.includes(actor.id)) {
      let matchScore = 0;
      let position = '';
      
      // Higher weight for lead actors
      if (index === 0) {
        matchScore = WEIGHTS.CONTENT.ACTOR_1;
        position = 'Lead';
      } else if (index === 1) {
        matchScore = WEIGHTS.CONTENT.ACTOR_2;
        position = 'Supporting';
      } else if (index === 2) {
        matchScore = WEIGHTS.CONTENT.ACTOR_3;
        position = 'Supporting';
      }
      
      if (matchScore > 0) {
        score += matchScore;
        matches.push({
          type: 'actor',
          name: actor.name,
          role: position,
          character: actor.character,
          score: matchScore.toFixed(2)
        });
      }
    }
  });
  
  // 3. Genre similarity (Jaccard index with genre weights)
  if (sourceMovie.genres?.length > 0 && targetMovie.genres?.length > 0) {
    const sourceGenres = sourceMovie.genres.map(g => g.id || g);
    const targetGenres = targetMovie.genres.map(g => g.id || g);
    
    const uniqueGenres = new Set([...sourceGenres, ...targetGenres]);
    if (uniqueGenres.size > 0) {
      const intersection = sourceGenres.filter(id => targetGenres.includes(id)).length;
      const union = uniqueGenres.size;
      const similarity = intersection / union;
      
      const matchScore = WEIGHTS.CONTENT.GENRE * similarity;
      score += matchScore;
      
      const matchedGenres = targetMovie.genres
        .filter(g => sourceGenres.includes(g.id || g))
        .map(g => (typeof g === 'object' ? g.name : g));
      
      if (matchedGenres.length > 0) {
        matches.push({
          type: 'genre',
          genreSimilarity: `${Math.round(similarity * 100)}%`,
          score: matchScore.toFixed(2),
          matchedGenres
        });
      }
    }
  }
  
  // 4. Keyword/theme similarity (if available)
  if (sourceMovie.keywords?.length > 0 && targetMovie.keywords?.length > 0) {
    const sourceKeywords = sourceMovie.keywords.map(k => k.id || k);
    const targetKeywords = targetMovie.keywords.map(k => k.id || k);
    
    const commonKeywords = sourceKeywords.filter(k => targetKeywords.includes(k));
    if (commonKeywords.length > 0) {
      const matchScore = WEIGHTS.CONTENT.KEYWORDS * 
        (commonKeywords.length / Math.max(sourceKeywords.length, targetKeywords.length));
      
      score += matchScore;
      matches.push({
        type: 'keyword',
        score: matchScore.toFixed(2),
        matchedKeywords: commonKeywords.slice(0, 3) // Show top 3 matching keywords
      });
    }
  }
  
  // 5. Consider movie rating (weighted by number of votes)
  if (targetMovie.vote_average && targetMovie.vote_count > 100) {
    // Normalize to 0-1 scale (assuming 0-10 rating)
    const ratingScore = (targetMovie.vote_average / 10) * WEIGHTS.CONTENT.VOTE_AVERAGE;
    const voteWeight = Math.min(1, Math.log10(targetMovie.vote_count) / 6); // Scale by vote count
    
    score += ratingScore * voteWeight;
  }
  
  // 6. Consider popularity (with diminishing returns)
  if (targetMovie.popularity) {
    const popularityScore = Math.min(1, targetMovie.popularity / 100) * WEIGHTS.CONTENT.POPULARITY;
    score += popularityScore;
  }
  
  // 7. Recency bonus/penalty
  if (targetMovie.release_date) {
    const releaseYear = new Date(targetMovie.release_date).getFullYear();
    const yearsAgo = currentYear - releaseYear;
    
    // Recent movies get a small boost, older movies get a small penalty
    const recencyFactor = yearsAgo <= 2 ? 0.05 : 
                         yearsAgo <= 5 ? 0 : 
                         WEIGHTS.RECENCY_PENALTY * (yearsAgo / 10);
    
    score += recencyFactor;
  }
  
  return { 
    score: Math.max(0, Math.min(1, score)), // Ensure score is between 0 and 1
    matches 
  };
};

/**
 * Calculate collaborative filtering score with enhanced personalization
 */
const calculateCollaborativeScore = async (movie, userData) => {
  const { ratings = [], watchlist = [] } = userData;
  
  // If user hasn't rated enough movies, use a default score
  if (ratings.length < MIN_RATED_MOVIES_FOR_PERSONALIZATION) {
    // Return a small score that encourages diversity for new users
    return Math.random() * 0.1 * WEIGHTS.COLLABORATIVE;
  }
  
  // 1. Calculate similarity to each rated movie, weighted by rating
  let totalWeight = 0;
  let totalScore = 0;
  
  // Cache for movie details to avoid duplicate API calls
  const movieDetailsCache = new Map();
  
  // Process ratings in parallel
  await Promise.all(ratings.map(async (ratedMovie) => {
    try {
      // Get full movie details if not already in cache
      if (!movieDetailsCache.has(ratedMovie.id)) {
        const details = await getCachedMovieDetails(ratedMovie.id);
        movieDetailsCache.set(ratedMovie.id, details);
      }
      
      const ratedMovieDetails = movieDetailsCache.get(ratedMovie.id);
      
      // Calculate content similarity (0-1)
      const { score: contentSimilarity } = calculateContentSimilarity(
        ratedMovieDetails,
        movie
      );
      
      // Convert rating to weight (emphasize higher ratings)
      // Using exponential scaling to give more weight to higher ratings
      const ratingWeight = Math.pow((ratedMovie.rating - 1) / 4, 2);
      
      // Boost similarity based on how much the user liked the similar movie
      // This creates a stronger preference for movies similar to highly-rated ones
      const ratingBoost = 0.5 + (ratedMovie.rating / 2); // 1-5 star -> 1x to 3.5x multiplier
      
      // Add to totals with weighted importance
      totalScore += contentSimilarity * ratingWeight * ratingBoost;
      totalWeight += ratingWeight;
      
    } catch (error) {
      console.error(`Error processing movie ${ratedMovie.id}:`, error);
    }
  }));
  
  // 2. Consider watchlist items (treat as slightly positive signals)
  if (watchlist.length > 0) {
    await Promise.all(watchlist.slice(0, 10).map(async (watchlistMovieId) => {
      try {
        // Get movie details
        const watchlistMovie = await getCachedMovieDetails(watchlistMovieId);
        
        // Calculate similarity to watchlisted movie
        const { score: watchlistSimilarity } = calculateContentSimilarity(
          watchlistMovie,
          movie
        );
        
        // Add a smaller weight for watchlist items
        totalScore += watchlistSimilarity * WEIGHTS.WATCHLIST_BOOST;
        totalWeight += WEIGHTS.WATCHLIST_BOOST;
        
      } catch (error) {
        console.error(`Error processing watchlist movie ${watchlistMovieId}:`, error);
      }
    }));
  }
  
  // 3. Normalize the score
  const normalizedScore = totalWeight > 0 ? 
    (totalScore / totalWeight) * WEIGHTS.COLLABORATIVE : 
    0;
  
  // 4. Add some randomness to break ties and provide variety
  const randomFactor = 1 + (Math.random() * 0.1 - 0.05); // ±5% randomness
  
  return Math.max(0, Math.min(1, normalizedScore * randomFactor));
};

/**
 * Get personalized movie recommendations based on a source movie and user data
 */
const getRecommendations = async (source, userData = {}) => {
  try {
    // Get the source movie details (if source is a movie ID)
    const sourceMovie = typeof source === 'object' ? 
      source : 
      await getCachedMovieDetails(source);
    
    if (!sourceMovie || !sourceMovie._fullDetails) {
      throw new Error('Could not fetch details for the source movie');
    }
    
    console.log(`Generating recommendations based on: ${sourceMovie.title}`);
    
    // 1. Get multiple sources of potential recommendations
    const [
      similarMovies,
      recommendations,
      directorMovies,
      genreRecommendations,
      trendingMovies
    ] = await Promise.all([
      // Get similar movies from TMDB
      getSimilarMovies(sourceMovie.id, { page: 1 })
        .then(res => res.results || [])
        .catch(() => []),
      
      // Get TMDB recommendations
      getTmdbRecommendations(sourceMovie.id, { page: 1 })
        .then(res => res.results || [])
        .catch(() => []),
      
      // Get other movies by the same director
      sourceMovie.director?.id ? 
        discoverMovies({ 
          with_crew: sourceMovie.director.id,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100
        }).then(res => res.results || []).catch(() => []) : 
        Promise.resolve([]),
      
      // Get movies in the same genres
      sourceMovie.genres?.length > 0 ?
        discoverMovies({
          with_genres: sourceMovie.genres.slice(0, 2).map(g => g.id || g).join(','),
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100,
          'primary_release_date.gte': '2010-01-01' // Recent movies only
        }).then(res => res.results || []).catch(() => []) :
        Promise.resolve([]),
      
      // Get trending movies as fallback
      getTrending('movie', 'week')
        .then(res => res.results || [])
        .catch(() => [])
    ]);
    
    // 2. Combine and deduplicate movies
    const allCandidates = [
      ...similarMovies,
      ...recommendations,
      ...directorMovies,
      ...genreRecommendations,
      ...trendingMovies
    ];
    
    // Remove duplicates and the source movie
    const uniqueMovies = [];
    const seenIds = new Set([sourceMovie.id]);
    
    for (const movie of allCandidates) {
      if (!movie?.id || seenIds.has(movie.id)) continue;
      seenIds.add(movie.id);
      uniqueMovies.push(movie);
      
      // Limit the number of candidates to process for performance
      if (uniqueMovies.length >= 100) break;
    }
    
    console.log(`Processing ${uniqueMovies.length} candidate movies...`);
    
    // 3. Score each candidate movie
    const scoredMovies = [];
    
    // Process movies in batches to avoid overwhelming the API
    const BATCH_SIZE = 10;
    for (let i = 0; i < uniqueMovies.length; i += BATCH_SIZE) {
      const batch = uniqueMovies.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (movie) => {
          try {
            // Get full movie details
            const movieDetails = await getCachedMovieDetails(movie.id);
            if (!movieDetails._fullDetails) return null;
            
            // Calculate content-based similarity score
            const { score: contentScore, matches } = calculateContentSimilarity(
              sourceMovie,
              movieDetails
            );
            
            // Skip if below minimum similarity threshold
            if (contentScore < WEIGHTS.MIN_SIMILARITY) return null;
            
            // Calculate collaborative filtering score if user data is available
            const collaborativeScore = userData ? 
              await calculateCollaborativeScore(movieDetails, userData) : 0;
            
            // Calculate diversity score (penalize movies too similar to each other)
            let diversityScore = 1;
            if (scoredMovies.length > 0) {
              const avgSimilarity = scoredMovies
                .slice(0, 5) // Only check against top 5 so far
                .reduce((sum, scored) => {
                  const { score } = calculateContentSimilarity(movieDetails, scored.movie);
                  return sum + score;
                }, 0) / Math.min(5, scoredMovies.length);
              
              diversityScore = 1 - (avgSimilarity * 0.5); // Reduce score by up to 50% for similarity
            }
            
            // Combine scores with weights
            const totalScore = (
              (contentScore * 0.6) + 
              (collaborativeScore * 0.4)
            ) * diversityScore;
            
            return {
              movie: movieDetails,
              score: totalScore,
              contentScore,
              collaborativeScore,
              diversityScore,
              matches
            };
            
          } catch (error) {
            console.error(`Error processing movie ${movie.id}:`, error);
            return null;
          }
        })
      );
      
      // Add valid results to our scored movies
      const validResults = batchResults.filter(result => result !== null);
      scoredMovies.push(...validResults);
      
      // If we already have enough high-quality recommendations, we can stop early
      if (scoredMovies.length >= 50) break;
    }
    
    // 4. Sort by total score and apply final filtering
    const finalRecommendations = scoredMovies
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Return top 20 recommendations
      .map(({ movie, score, contentScore, collaborativeScore, matches }) => ({
        ...movie,
        _score: score,
        _contentScore: contentScore,
        _collaborativeScore: collaborativeScore,
        matches: matches || []
      }));
    
    console.log(`Generated ${finalRecommendations.length} recommendations`);
    return finalRecommendations;
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Return trending movies as fallback
    try {
      const { results = [] } = await getTrending('movie', 'week');
      return results.slice(0, 10);
    } catch (fallbackError) {
      console.error('Fallback recommendation failed:', fallbackError);
      return [];
    }
  }
};

// Export the main function
const recommendationEngine = {
  getRecommendations
};

export default recommendationEngine;
