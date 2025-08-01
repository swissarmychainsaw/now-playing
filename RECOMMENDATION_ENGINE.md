# Movie Recommendation Engine

## Overview
The recommendation engine is a hybrid system that combines content-based and collaborative filtering techniques to provide personalized movie recommendations. It's designed to suggest relevant movies based on a user's preferences, viewing history, and the characteristics of movies they've enjoyed.

## Architecture

The recommendation system is built around three main components:

1. **Content-Based Filtering**
   - Analyzes movie attributes (genres, director, actors)
   - Calculates similarity between movies based on content features
   - Doesn't require user data to function

2. **Collaborative Filtering**
   - Uses user ratings to find patterns in user preferences
   - Recommends movies that similar users have enjoyed
   - Becomes more accurate with more user data

3. **Hybrid Approach**
   - Combines both methods for more accurate recommendations
   - Adjusts weights based on data availability
   - Falls back to popular movies when needed

## Implementation Details

### Core Components

#### 1. Content-Based Filtering

```javascript
const calculateContentSimilarity = (movie1, movie2) => {
  // Implementation details...
};
```

**Features Considered:**
- **Director (15% weight)**
  - Additional 10% boost for Oscar-winning directors
  - Director's previous work and success rate are considered
- **Lead Actor (20% weight)**
  - Higher weight for lead actors with critical acclaim
- **Supporting Actors (15% + 10% weights)**
  - Weighted by their prominence and recognition
- **Genre/Tone (40% weight)**
  - Primary genre match has higher weight
  - Secondary genres contribute to the overall score
- **Awards & Recognition**
  - Oscar-winning movies receive a 15% boost
  - Other major awards (BAFTA, Golden Globes) contribute to the score
- **Rating-Based Weighting**
  - Higher rated movies (TMDB rating > 7.5) receive additional weight
  - User ratings influence the final recommendation score (25% weight)

#### 2. Collaborative Filtering

```javascript
const calculateCollaborativeScore = (movie, userData) => {
  // Implementation details...
};
```

**Key Aspects:**
- Requires minimum 5 rated movies for personalization
- Considers both positive and negative ratings
- Applies time decay to older ratings

#### 3. Hybrid Recommendation Engine

```javascript
export const getRecommendations = async (movieId, userData = {}) => {
  // Implementation details...
};
```

**Recommendation Process:**
1. Fetches detailed movie information
2. Gets content-based recommendations
3. Gets collaborative recommendations (if enough data)
4. Combines and ranks recommendations
5. Applies personalization based on user data
6. Returns top 5 recommendations

### Caching Strategy

- **In-Memory Cache**: Stores movie details to reduce API calls
- **TTL (Time-To-Live)**: 5 minutes for search results
- **Fallback Mechanism**: Returns popular movies if specific recommendations fail

## Configuration

### Weights

```javascript
const WEIGHTS = {
  CONTENT: {
    DIRECTOR: 0.15,
    OSCAR_WINNING_DIRECTOR_BOOST: 0.1,  // Additional boost for Oscar-winning directors
    ACTOR_1: 0.2,
    ACTOR_2: 0.15,
    ACTOR_3: 0.1,
    GENRE_TONE: 0.4,
    OSCAR_WINNING_MOVIE_BOOST: 0.15,   // Additional boost for Oscar-winning movies
    RATING_WEIGHT: 0.25,               // Weight for movie ratings in scoring
  },
  COLLABORATIVE: 0.4,
  WATCHLIST_BOOST: 0.1,
  RECENCY_PENALTY: -0.1
};
```

### Thresholds

- `MIN_RATED_MOVIES_FOR_PERSONALIZATION`: 5
- Minimum similarity score for recommendations: 0.1
- Maximum recommendations returned: 5

## Usage

### Basic Usage

```javascript
import { getRecommendations } from './services/recommendationEngine';

// Get recommendations for movie with ID 123
const recommendations = await getRecommendations(123, {
  ratings: [
    { movie_id: 456, user_rating: 4.5 },
    { movie_id: 789, user_rating: 3.0 }
  ],
  watchlist: [123, 456],
  not_interested: [789]
});
```

### Response Format

Each recommendation includes:
- Movie details (id, title, overview, etc.)
- `_score`: The recommendation score (0-1)
- `_matches`: Array of matching criteria with scores, including:
  - Director matches (with Oscar status if applicable)
  - Actor matches
  - Genre matches
  - Award-related boosts
  - Rating-based adjustments

Example:
```javascript
{
  id: 123,
  title: "Inception",
  overview: "A thief who steals corporate secrets...",
  _score: 0.87,
  _matches: [
    {
      type: "director",
      name: "Christopher Nolan",
      score: "0.15"
    },
    {
      type: "genre",
      genreSimilarity: "75%",
      score: "0.30",
      matchedGenres: ["Action", "Sci-Fi"]
    }
  ]
}
```

## Fallback Mechanism

If specific recommendations can't be generated, the system falls back to:
1. Popular movies from the same genre
2. General popular movies
3. Random movies from the database

## Error Handling

The system includes multiple fallback layers to ensure recommendations are always available:
1. Primary recommendation method
2. Fallback to popular movies in same genre
3. Fallback to general popular movies
4. Final fallback to any available movies

## Performance Considerations

- **Caching**: Reduces API calls and improves response times
- **Parallel Processing**: Fetches data in parallel when possible
- **Lazy Loading**: Only computes what's necessary
- **Memory Management**: Uses efficient data structures

## Limitations

1. Requires sufficient user data for personalization
2. May not handle niche genres as well as mainstream ones
3. Limited by the quality and quantity of metadata available

## TMDB Recommendation Endpoint Integration

### Overview
TMDB provides a built-in recommendation endpoint that can be used as a foundation for our recommendation system:
```
GET /movie/{movie_id}/recommendations
```

### Implementation Example
```javascript
// In tmdb.js service
const getMovieRecommendations = async (movieId, options = {}) => {
  const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
    params: {
      language: 'en-US',
      page: 1,
      ...options
    }
  });
  return response.data;
};
```

### Hybrid Recommendation Strategy
Combine TMDB's recommendations with our custom logic:

1. **Base Layer**: TMDB's recommendations
2. **Enhancement Layer**:
   - User's watch history
   - Genre preferences
   - Director/actor preferences
   - Rating patterns

```javascript
async function getHybridRecommendations(movieId, userData) {
  // Get TMDB's recommendations
  const { results: tmdbRecs } = await tmdbService.getMovieRecommendations(movieId);
  
  // Apply our scoring
  return tmdbRecs
    .map(movie => ({
      ...movie,
      _score: calculateContentSimilarity(movie, userData),
      _source: 'tmdb_hybrid'
    }))
    .sort((a, b) => b._score - a._score);
}
```

### Caching Strategy
- Cache recommendations for 24 hours
- Invalidate cache when user preferences change
- Use movie ID + user ID as cache key

### Benefits
- **Reduced Development Time**: Leverage TMDB's algorithm
- **Better Performance**: Offload complex calculations
- **Continuous Improvement**: Benefits from TMDB's updates
- **Fallback Mechanism**: Always have recommendations available

## Future Improvements

1. **Enhanced Award Recognition"
   - Expand beyond Oscars to include more award bodies
   - Consider award categories and their relevance to the user

2. **Dynamic Weighting**
   - Adjust weights based on user feedback and interaction patterns
   - Implement A/B testing for weight optimization

3. **Rating Normalization**
   - Account for rating inflation across different time periods
   - Consider the number of ratings when weighting scores

4. **User Preferences**
   - Allow users to customize the importance of different factors
   - Implement preference learning over time

5. **Content Analysis**
   - Add more sophisticated NLP for better content understanding
   - Include sentiment analysis of reviews

6. **Social & Temporal**
   - Include social recommendations from friends
   - Add temporal dynamics for trending content

7. **Cold Start Solutions**
   - Improve recommendations for new users and movies
   - Implement better fallback mechanisms

## Dependencies

- TMDB API for movie data
- Local caching mechanism
- React for the frontend integration

## Troubleshooting

Common issues and solutions:

1. **No Recommendations**
   - Check API connectivity
   - Verify movie IDs are valid
   - Ensure sufficient data is available

2. **Irrelevant Recommendations**
   - Check user data quality
   - Review weight configurations
   - Verify metadata accuracy

3. **Performance Issues**
   - Check cache hit rates
   - Review API call patterns
   - Monitor memory usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

---

*Documentation generated on August 1, 2025*
