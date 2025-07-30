import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa';
import { useRatings } from '../../context/RatingsContext';
import { useMovieRating } from '../../hooks/useMovieRating';

const RatingsPage = () => {
  const [activeTab, setActiveTab] = useState('liked');
  const { getMoviesByRating, loading } = useRatings();
  const { toggleLike, toggleDislike } = useMovieRating();
  
  // Get liked (4-5 stars) and disliked (1-2 stars) movies
  const likedMovies = getMoviesByRating(4, 5);
  const dislikedMovies = getMoviesByRating(1, 2);
  
  // Determine which movies to show based on active tab
  const moviesToShow = activeTab === 'liked' ? likedMovies : dislikedMovies;

  const renderMovies = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-primary text-2xl mr-2" />
          <span className="text-gray-600">Loading your ratings...</span>
        </div>
      );
    }

    if (moviesToShow.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {activeTab === 'liked' 
              ? "You haven't liked any movies yet."
              : "You haven't disliked any movies yet."}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Rate movies to see them here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {moviesToShow.map((rating) => {
          const movie = rating;
          const isLiked = activeTab === 'liked';
          
          return (
            <div key={movie.movieId} className="group relative">
              <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No poster</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div>
                    <h3 className="text-white font-semibold">{movie.title}</h3>
                    <div className="flex items-center text-yellow-400 mt-1">
                      <FaStar className="mr-1" />
                      <span className="text-sm">{movie.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2">
                  <button 
                    className={`p-2 bg-black/70 rounded-full text-white hover:bg-primary transition-colors ${
                      isLiked ? 'text-red-500' : 'text-gray-300'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLiked) {
                        toggleLike(movie.movieId, movie, movie.rating);
                      } else {
                        toggleDislike(movie.movieId, movie, movie.rating);
                      }
                    }}
                    aria-label={isLiked ? 'Remove like' : 'Remove dislike'}
                  >
                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
              </div>
              
              <div className="mt-2">
                <h3 className="font-medium text-gray-900 line-clamp-1">{movie.title}</h3>
                <p className="text-sm text-gray-500">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
                <div className="flex items-center mt-1">
                  <FaStar className="text-yellow-400 mr-1 text-sm" />
                  <span className="text-sm text-gray-700">
                    {movie.rating.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Ratings</h1>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-colors ${
            activeTab === 'liked'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('liked')}
          disabled={loading}
        >
          <FaHeart className={activeTab === 'liked' ? 'text-red-300' : 'text-red-400'} />
          <span>Liked Movies</span>
          {!loading && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {likedMovies.length}
            </span>
          )}
        </button>
        
        <button
          className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-colors ${
            activeTab === 'disliked'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('disliked')}
          disabled={loading}
        >
          <FaRegHeart className={activeTab === 'disliked' ? 'text-red-300' : 'text-red-400'} />
          <span>Disliked Movies</span>
          {!loading && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {dislikedMovies.length}
            </span>
          )}
        </button>
      </div>

      {renderMovies()}
    </div>
  );
};

export default RatingsPage;
