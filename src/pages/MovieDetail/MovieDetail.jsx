import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRatings } from '../../context/RatingsContext';
import { useAuth } from '../../context/AuthContext';
import { useMovieRating } from '../../hooks/useMovieRating';
import { useMovieRecommendations } from '../../hooks/useMovieRecommendations';
import { toast } from 'react-hot-toast';
import { FaStar, FaFilm, FaPlay, FaTimes, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import MovieRecommendations from '../../components/MovieRecommendations/MovieRecommendations';

// Helper functions
const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
};

const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const getProviderUrl = (providerId, movieId, movieTitle) => {
  const providerLinks = {
    8: 'https://www.netflix.com/',
    9: 'https://www.primevideo.com/',
    337: 'https://www.disneyplus.com/',
    15: 'https://www.hulu.com/',
    531: 'https://www.paramountplus.com/',
    350: 'https://tv.apple.com/',
    29: 'https://www.vudu.com/',
    192: 'https://www.youtube.com/movies',
    2: 'https://tv.apple.com/',
    3: `https://play.google.com/store/movies/details?id=${movieTitle.replace(/\s+/g, '_')}`,
    358: 'https://www.max.com/'
  };
  return providerLinks[providerId] || `https://www.themoviedb.org/movie/${movieId}/watch`;
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Get recommendations for this movie
  const { 
    recommendations, 
    isLoading: isLoadingRecommendations, 
    error: recommendationsError,
    refetch: refetchRecommendations 
  } = useMovieRecommendations(id);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [director, setDirector] = useState(null);
  const [cast, setCast] = useState([]);
  const [providers, setProviders] = useState({ flatrate: [], buy: [], rent: [] });
  
  // Rating hooks
  const { getMovieRating, loading: ratingsLoading } = useRatings();
  const { rateMovie, isRating } = useMovieRating();
  const [currentRating, setCurrentRating] = useState(0);

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) throw new Error('TMDB API key not found');
        
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,watch/providers,videos`
        );
        
        if (!response.ok) throw new Error('Failed to fetch movie details');
        
        const data = await response.json();
        setMovie(data);
        
        // Extract director and cast
        const movieDirector = data.credits?.crew?.find(p => p.job === 'Director');
        setDirector(movieDirector);
        setCast(data.credits?.cast?.slice(0, 3) || []);
        
        // Set current rating if exists
        const rating = getMovieRating(data.id)?.rating || 0;
        setCurrentRating(rating);
        
        // Extract watch providers
        const usProviders = data['watch/providers']?.results?.US || {};
        setProviders({
          flatrate: usProviders.flatrate || [],
          buy: usProviders.buy || [],
          rent: usProviders.rent || []
        });
        
        // Find trailer
        const trailer = data.videos?.results?.find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (trailer?.key) {
          setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
        }
        
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [id, getMovieRating]);

  // Handle rating a movie
  const handleRateMovie = async (rating) => {
    if (!user) {
      toast.error('Please sign in to rate movies');
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }

    if (isRating || !movie) return;
    
    const newRating = currentRating === rating ? 0 : rating;
    
    try {
      await rateMovie(movie.id, newRating, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
      });
      
      setCurrentRating(newRating);
      
      toast.success(
        newRating > 0 
          ? `Rated ${newRating} star${newRating > 1 ? 's' : ''}!`
          : 'Rating removed'
      );
      
      // Refresh recommendations after rating
      refetchRecommendations();
    } catch (error) {
      console.error('Error rating movie:', error);
      toast.error('Failed to update rating');
    }
  };
  
  // Handle status change (watchlist, not interested)
  const handleStatusChange = async (movieId, status) => {
    if (!user) {
      toast.error('Please sign in to update your watchlist');
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }
    
    try {
      // Convert status to rating value (-1 for not interested, -2 for watchlist)
      const ratingValue = status === 'not_interested' ? -1 : -2;
      
      await rateMovie(movieId, ratingValue, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
      });
      
      // Show success message
      const action = status === 'not_interested' ? 'marked as not interested' : 'added to watchlist';
      toast.success(`${movie.title} ${action}`);
      
      // Refresh recommendations
      refetchRecommendations();
    } catch (error) {
      console.error('Error updating movie status:', error);
      toast.error('Failed to update movie status. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-4 bg-gray-800/80 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Error Loading Movie</h2>
          <p className="text-gray-300 mb-6">{error || 'Movie not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Format release year
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  
  // Combine all providers, removing duplicates
  const allProviders = [
    ...new Map([
      ...providers.flatrate,
      ...providers.buy,
      ...providers.rent
    ].map(provider => [provider.provider_id, provider])).values()
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Backdrop */}
      {movie.backdrop_path && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90">
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover opacity-30"
              onError={(e) => {
                if (e.target) e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Results
          </button>
          
          {/* Movie Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Poster */}
            <div className="lg:w-1/4">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 shadow-xl">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      if (e.target) e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <FaFilm className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle Column - Movie Details */}
            <div className="lg:w-2/4">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl">
                {/* Title and Metadata */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">
                    {movie.title} {releaseYear && `(${releaseYear})`}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm mb-4">
                    {movie.release_date && (
                      <span>{new Date(movie.release_date).toLocaleDateString()}</span>
                    )}
                    {movie.runtime > 0 && (
                      <span>{formatRuntime(movie.runtime)}</span>
                    )}
                    {movie.vote_average > 0 && (
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{movie.vote_average.toFixed(1)}/10</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Genres */}
                  {movie.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map(genre => (
                        <span 
                          key={genre.id}
                          className="px-3 py-1 bg-gray-800 text-sm rounded-full"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Overview */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3 flex items-center">
                    <span className="w-8 h-0.5 bg-blue-500 mr-3"></span>
                    Overview
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>
                
                {/* Cast & Crew */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="w-8 h-0.5 bg-blue-500 mr-3"></span>
                    Cast & Crew
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Director */}
                    {director && (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-800 mb-2">
                          {director.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${director.profile_path}`}
                              alt={director.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e.target) {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling?.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs font-bold">
                            {getInitials(director.name)}
                          </div>
                        </div>
                        <h4 className="font-medium text-sm">{director.name}</h4>
                        <p className="text-xs text-gray-400">Director</p>
                      </div>
                    )}
                    
                    {/* Top Cast Members */}
                    {cast.map(person => (
                      <div key={person.id} className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-800 mb-2">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                              alt={person.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e.target) {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling?.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs font-bold">
                            {getInitials(person.name)}
                          </div>
                        </div>
                        <h4 className="font-medium text-sm">{person.name}</h4>
                        <p className="text-xs text-gray-400">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Actions */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-4">
                {/* Your Rating */}
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50 shadow-lg">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                    <span className="w-6 h-0.5 bg-blue-500 mr-2"></span>
                    Your Rating
                  </h2>
                  <div className="flex flex-col items-center">
                    {ratingsLoading ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-pulse flex space-x-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-6 h-6 bg-gray-700 rounded"></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateMovie(star)}
                            className={`text-2xl transition-colors ${currentRating >= star ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                            disabled={isRating}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-sm text-gray-400">
                      {currentRating > 0 
                        ? `You rated this ${currentRating} star${currentRating > 1 ? 's' : ''}` 
                        : 'Rate this movie'}
                    </span>
                  </div>
                </div>
                
                {/* Watch Trailer */}
                {trailerUrl && (
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50 shadow-lg">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                      <span className="w-6 h-0.5 bg-red-500 mr-2"></span>
                      Watch Trailer
                    </h2>
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPlay className="w-4 h-4" />
                      Play Trailer
                    </button>
                  </div>
                )}
                
                {/* Where to Watch */}
                {allProviders.length > 0 && (
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-5 border border-gray-800/50 shadow-lg">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                      <span className="w-6 h-0.5 bg-blue-500 mr-2"></span>
                      Where to Watch
                    </h2>
                    <div className="space-y-3">
                      {allProviders.map((provider) => (
                        <a
                          key={provider.provider_id}
                          href={getProviderUrl(provider.provider_id, movie.id, movie.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <div className="flex items-center p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800/80 transition-colors">
                            <div className="w-8 h-8 flex-shrink-0 bg-white rounded overflow-hidden">
                              <img
                                src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  if (e.target) {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling?.classList.remove('hidden');
                                  }
                                }}
                              />
                              <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs font-bold">
                                {getInitials(provider.provider_name)}
                              </div>
                            </div>
                            <span className="ml-3 font-medium text-sm flex-1">
                              {provider.provider_name}
                            </span>
                            <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations Section */}
      {!isLoadingRecommendations && recommendations?.length > 0 && (
        <div className="bg-gray-900 py-12">
          <div className="container mx-auto px-4">
            <MovieRecommendations 
              recommendations={recommendations}
              isLoading={isLoadingRecommendations}
              onRate={handleRateMovie}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && trailerUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative w-full max-w-6xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close trailer"
            >
              <FaTimes className="w-8 h-8" />
            </button>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-[70vh]"
                src={`${trailerUrl}?autoplay=1&mute=1`}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
