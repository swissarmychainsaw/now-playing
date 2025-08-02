import React from 'react';
import { ExtendedMovie } from '../../types/tmdb';
import { FaPlay } from 'react-icons/fa';

interface SearchResultCardProps {
  movie: ExtendedMovie;
  onRate: (rating: number) => void;
  onWatchlistToggle: () => void;
  onNotInterested: () => void;
  userRating?: number;
  inWatchlist?: boolean;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  movie,
  onRate,
  onWatchlistToggle,
  onNotInterested,
  userRating = 0,
  inWatchlist = false,
}) => {
  // Format runtime as "Xh Ym"
  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get first 3 cast members
  const topCast = movie.credits?.cast.slice(0, 3) || [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Main Card */}
      <div className="flex flex-col md:flex-row">
        {/* Poster */}
        <div className="w-full md:w-36 h-52 flex-shrink-0">
          {movie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={`${movie.title} poster`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No poster</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="p-4 flex-1">
          {/* CTA Section */}
          <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b">
            {/* Rating */}
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onRate(star)}
                  className="text-yellow-500 text-xl focus:outline-none"
                  aria-label={`Rate ${star} star`}
                >
                  {star <= (userRating || 0) ? '★' : '☆'}
                </button>
              ))}
            </div>

            {/* Watchlist Button */}
            <button
              onClick={onWatchlistToggle}
              className={`px-3 py-1 rounded ${inWatchlist ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            >
              {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>

            {/* Not Interested Button */}
            <button
              onClick={onNotInterested}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded"
            >
              Not Interested
            </button>
          </div>

          {/* Title and Metadata */}
          <div className="mb-2">
            <h2 className="text-xl font-bold">
              {movie.title} 
              {movie.release_date && (
                <span className="text-gray-600 text-lg font-normal ml-2">
                  ({new Date(movie.release_date).getFullYear()})
                </span>
              )}
            </h2>
            
            {movie.tagline && (
              <p className="text-gray-600 italic mb-2">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              {movie.vote_average > 0 && (
                <span>{(movie.vote_average * 10).toFixed(0)}% Rating</span>
              )}
              {movie.runtime > 0 && (
                <span>{formatRuntime(movie.runtime)}</span>
              )}
              {movie.genres?.length > 0 && (
                <span>{movie.genres.map(g => g.name).join(', ')}</span>
              )}
            </div>
          </div>

          {/* Overview */}
          <p className="text-gray-700 mb-4 line-clamp-3">
            {movie.overview}
          </p>

          {/* Watch Trailer Button */}
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <FaPlay className="mr-1" />
            Watch Trailer
          </button>
        </div>

        {/* Cast Section */}
        <div className="w-full md:w-48 p-4 border-l border-gray-200">
          <h3 className="font-semibold mb-2">Top Cast</h3>
          <div className="space-y-2">
            {topCast.map((person) => (
              <div key={person.id} className="text-sm">
                <div className="font-medium">{person.name}</div>
                <div className="text-gray-600 text-xs">{person.character}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {movie.recommendations?.length > 0 && (
        <div className="bg-gray-50 p-4 border-t">
          <h3 className="font-semibold mb-3">Recommended Movies</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {movie.recommendations.slice(0, 5).map((rec) => (
              <div 
                key={rec.id} 
                className="w-24 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="w-full h-32 bg-gray-200 rounded mb-1 overflow-hidden">
                  {rec.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                      alt={rec.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="text-xs font-medium truncate">{rec.title}</div>
                {rec.vote_average > 0 && (
                  <div className="text-xs text-gray-500">
                    {(rec.vote_average * 10).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultCard;
