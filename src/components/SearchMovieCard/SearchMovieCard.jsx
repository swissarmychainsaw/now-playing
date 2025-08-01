import React, { useState, useEffect } from 'react';
import { FaStar, FaPlayCircle, FaInfoCircle, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaEllipsisH } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SearchMovieCard = ({ movie, onSelect, reason, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Check if movie is in favorites/watchlist on mount
  useEffect(() => {
    const checkStatus = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setIsFavorite(favorites.includes(movie.id));
        setIsWatchlisted(watchlist.includes(movie.id));
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    };
    
    checkStatus();
  }, [movie.id]);

  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/no-poster.jpg';
    
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  
  const toggleFavorite = (e) => {
    e.stopPropagation();
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      let updatedFavorites;
      
      if (isFavorite) {
        updatedFavorites = favorites.filter(id => id !== movie.id);
      } else {
        updatedFavorites = [...favorites, movie.id];
      }
      
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };
  
  const toggleWatchlist = (e) => {
    e.stopPropagation();
    try {
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      let updatedWatchlist;
      
      if (isWatchlisted) {
        updatedWatchlist = watchlist.filter(id => id !== movie.id);
      } else {
        updatedWatchlist = [...watchlist, movie.id];
      }
      
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setIsWatchlisted(!isWatchlisted);
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) {
      return;
    }
    onSelect?.(movie);
  };

  // Generate initials from movie title
  const getInitials = (title) => {
    if (!title) return 'MV';
    return title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-lg overflow-hidden bg-gray-800 shadow-lg h-full flex flex-col group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMenuOpen(false);
      }}
      onClick={handleCardClick}
    >
      {/* Movie Poster */}
      <div className="relative pb-[150%] bg-gray-900">
        {imageUrl.endsWith('no-poster.jpg') ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
            <span className="text-3xl font-bold text-white/70">
              {getInitials(movie.title)}
            </span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/no-poster.jpg';
            }}
          />
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${
          isHovered ? 'bg-black/60' : 'bg-black/0'
        }`}>
          <div className={`transform transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            <FaPlayCircle className="text-white text-4xl mx-auto mb-2" />
            <span className="text-white font-medium">View Details</span>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
          <FaStar className="mr-1" />
          <span>{rating}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button 
            onClick={toggleFavorite}
            className="action-button w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-all"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          
          <button 
            onClick={toggleWatchlist}
            className="action-button w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-all"
            aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isWatchlisted ? <FaBookmark className="text-blue-400" /> : <FaRegBookmark />}
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="action-button w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-all"
              aria-label="More options"
            >
              <FaEllipsisH className="text-sm" />
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-1 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800">
                    Add to list
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800">
                    Rate this
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800">
                    Share
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Movie Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-white mb-1 line-clamp-2" title={movie.title}>
          {movie.title}
        </h3>
        
        <div className="flex items-center text-gray-400 text-sm mb-2">
          {releaseYear && <span>{releaseYear}</span>}
          {movie.genre_ids && movie.genre_ids.length > 0 && releaseYear && (
            <span className="mx-1">•</span>
          )}
          {movie.genre_names && movie.genre_names.length > 0 && (
            <span className="truncate">{movie.genre_names[0]}</span>
          )}
        </div>
        
        {/* Recommendation Reason */}
        {reason && (
          <div className="mt-auto pt-2 text-xs text-blue-400 border-t border-gray-700 flex items-center">
            <FaInfoCircle className="mr-1 flex-shrink-0" />
            <span className="truncate">{reason}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

SearchMovieCard.defaultProps = {
  reason: '',
  onSelect: null,
};

export default SearchMovieCard;
