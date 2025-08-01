import React from 'react';
import { FaStar, FaFilm, FaUserTie, FaUserFriends, FaTheaterMasks } from 'react-icons/fa';
import MovieCard from '../MovieCard/MovieCard';
import { useRatings } from '../../context/RatingsContext';

const getMatchTypeIcon = (type) => {
  switch (type) {
    case 'director':
      return <FaUserTie className="inline mr-1" title="Director" />;
    case 'actor':
      return <FaUserFriends className="inline mr-1" title="Actor" />;
    case 'similarity':
      return <FaTheaterMasks className="inline mr-1" title="Similarity" />;
    default:
      return <FaFilm className="inline mr-1" />;
  }
};

const getMatchTypeLabel = (type) => {
  switch (type) {
    case 'director': return 'Director';
    case 'actor': return 'Actor';
    case 'similarity': return 'Similar';
    default: return type;
  }
};

const MovieRecommendations = ({ recommendations, isLoading, onRate, onStatusChange }) => {
  const { ratings } = useRatings();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No recommendations available. Try rating more movies to get better suggestions.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((movie) => {
          const userRating = ratings[movie.id]?.rating || 0;
          const primaryMatch = movie.matches?.[0]; // Get the primary match type
          
          return (
            <div key={movie.id} className="group relative">
              {primaryMatch && (
                <div className="absolute -top-3 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  {getMatchTypeIcon(primaryMatch.type)}
                  <span className="capitalize">{getMatchTypeLabel(primaryMatch.type)}</span>
                </div>
              )}
              
              <MovieCard
                movie={{
                  ...movie,
                  user_rating: userRating
                }}
                showRating={true}
                showTitle={true}
                showYear={true}
                size="default"
                onRate={onRate}
                onStatusChange={onStatusChange}
              />
              
              {/* Match details */}
              <div className="mt-2 p-2 text-xs bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-semibold mb-1">Why recommended:</div>
                {movie.matches?.map((match, index) => (
                  <div key={index} className="mb-1 last:mb-0">
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      {getMatchTypeLabel(match.type)}: {match.name || ''}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Score: {match.score}
                    </div>
                  </div>
                ))}
                <div className="mt-2 pt-1 border-t border-gray-200 dark:border-gray-700 text-right">
                  <span className="font-semibold">Total: </span>
                  <span className="font-bold">{movie._score?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MovieRecommendations;
