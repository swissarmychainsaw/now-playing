import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { getOMDbPoster } from '../../utils/imageFallback';
import { useUser } from '../../context/UserContext';
import Rating from '../Rating/Rating';

const MovieCard = ({ movie, onRate, showRating = false }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [imgSrc, setImgSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Handle click on movie card
  const handleClick = useCallback(() => {
    if (onRate) {
      return; // Don't navigate if we're in rating mode
    }
    navigate(`/movie/${movie.id}`);
  }, [onRate, movie.id, navigate]);

  // Handle movie rating
  const handleRate = useCallback(async (movieId, rating) => {
    if (onRate) {
      await onRate(movieId, rating);
    }
  }, [onRate]);

  const loadImage = useCallback(() => {
    // Skip if no movie
    if (!movie) {
      setImgSrc('/placeholder-movie.png');
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }
    
    // Always return a cleanup function
    let isMounted = true;
    let tmdbImg = null;
    let omdbImg = null;

    const cleanup = () => {
      isMounted = false;
      if (tmdbImg) {
        tmdbImg.onload = null;
        tmdbImg.onerror = null;
        tmdbImg = null;
      }
      if (omdbImg) {
        omdbImg.onload = null;
        omdbImg.onerror = null;
        omdbImg = null;
      }
    };

    const loadImageAsync = async () => {
      try {
        // If no poster path, try to get from OMDb or use placeholder
        if (!movie.poster_path) {
          if (!movie.title) {
            throw new Error('No movie title available for OMDb lookup');
          }
          
          const omdbUrl = await getOMDbPoster(movie.title, movie.release_date?.substring(0, 4));
          
          if (omdbUrl && isMounted) {
            omdbImg = new Image();
            omdbImg.onload = () => {
              if (isMounted) {
                setImgSrc(omdbUrl);
                setLoading(false);
              }
            };
            omdbImg.onerror = () => {
              if (isMounted) {
                setImgSrc('/placeholder-movie.png');
                setLoading(false);
                setError(true);
              }
            };
            omdbImg.src = omdbUrl;
          } else if (isMounted) {
            setImgSrc('/placeholder-movie.png');
            setLoading(false);
          }
          return;
        }

        // Try TMDB first if we have a poster path
        const tmdbUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        
        tmdbImg = new Image();
        
        tmdbImg.onload = () => {
          if (isMounted) {
            setImgSrc(tmdbUrl);
            setLoading(false);
          }
        };
        
        tmdbImg.onerror = async () => {
          if (!isMounted) return;
          
          try {
            // Fallback to OMDb if TMDB fails
            if (!movie.title) throw new Error('No movie title for OMDb fallback');
            
            const omdbUrl = await getOMDbPoster(movie.title, movie.release_date?.substring(0, 4));
            
            if (omdbUrl && isMounted) {
              omdbImg = new Image();
              omdbImg.onload = () => {
                if (isMounted) {
                  setImgSrc(omdbUrl);
                  setLoading(false);
                }
              };
              omdbImg.onerror = () => {
                if (isMounted) {
                  setImgSrc('/placeholder-movie.png');
                  setLoading(false);
                  setError(true);
                }
              };
              omdbImg.src = omdbUrl;
            } else {
              throw new Error('No OMDb URL available');
            }
          } catch (err) {
            if (isMounted) {
              setImgSrc('/placeholder-movie.png');
              setLoading(false);
              setError(true);
            }
          }
        };
        
        tmdbImg.src = tmdbUrl;

      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setImgSrc('/placeholder-movie.png');
          setLoading(false);
          setError(true);
        }
      }
    };

    loadImageAsync();
    return cleanup;
  }, [movie.poster_path, movie.title, movie.release_date]);

  // Load image when component mounts or when the movie changes
  useEffect(() => {
    // Reset state when movie changes
    setImgSrc('');
    setLoading(true);
    setError(false);
    
    // Load the new image
    const cleanup = loadImage();
    
    // Cleanup function to cancel any pending image loads
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [movie.id, loadImage]);
  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer transition-all duration-300 hover:transform hover:scale-105"
    >
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-100">
        {loading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        ) : (
          <img
            src={imgSrc}
            alt={movie.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              error ? 'opacity-50' : ''
            }`}
            loading="lazy"
            onError={() => {
              setError(true);
              setImgSrc('/placeholder-movie.png');
            }}
          />
        )}
        
        {/* Oscar Winner Badge */}
        {movie.is_oscar_winner && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center z-10 shadow-lg">
            🏆 Oscar Winner
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center backdrop-blur-sm">
          <FaStar className="text-yellow-400 mr-1" />
          <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          {movie.vote_count > 0 && (
            <span className="ml-1 text-gray-300 text-[10px] font-normal">
              ({movie.vote_count.toLocaleString()})
            </span>
          )}
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center mb-2">
            <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded mr-2">
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </div>
            <span className="text-yellow-400 text-xs">
              {movie.vote_count ? `(${movie.vote_count.toLocaleString()})` : ''}
            </span>
          </div>
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
            {movie.title}
          </h3>
          {movie.release_date && (
            <p className="text-gray-300 text-sm mb-2">
              {new Date(movie.release_date).getFullYear()}
              {movie.original_language && movie.original_language !== 'en' && (
                <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                  {movie.original_language.toUpperCase()}
                </span>
              )}
            </p>
          )}
          <p className="text-gray-300 text-sm line-clamp-3">
            {movie.overview || 'No overview available.'}
          </p>
          {movie.genre_names && movie.genre_names.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {movie.genre_names.slice(0, 3).map((genre, index) => (
                <span key={index} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-600">
              {movie.year || (movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A')}
              {movie.is_oscar_winner && (
                <span className="ml-1 text-amber-600" title="Oscar Winner">🏆</span>
              )}
            </p>
            {showRating && (
              <div className="flex items-center">
                <Rating 
                  movieId={movie.id}
                  initialRating={movie.user_rating || 0}
                  onRate={handleRate}
                  size="xs"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
