import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRatings } from '../../context/RatingsContext';
import { useMovieRating } from '../../hooks/useMovieRating';
import { toast } from 'react-hot-toast';
import { FaStar, FaFilm, FaPlay, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Helper function to get initials from a name
 * @param {string} name - The full name
 * @returns {string} The first 3 initials of the name
 */
const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
};

/**
 * Helper function to format runtime in minutes to hours and minutes
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime (e.g., "2h 15m")
 */
const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Get the provider URL based on provider ID and name
 * @param {number} providerId - The provider ID from TMDB
 * @param {string} providerName - The provider name
 * @param {string} movieTitle - The movie title for search queries
 * @param {string} region - The region code (e.g., 'US')
 * @returns {string} The provider URL
 */
const getProviderUrl = (providerId, providerName, movieTitle, region = 'US') => {
  // Create a mapping of provider IDs to their respective URLs
  const providerLinks = {
    8: 'https://www.netflix.com/', // Netflix
    9: 'https://www.primevideo.com/', // Amazon Prime Video
    337: 'https://www.disneyplus.com/', // Disney+
    15: 'https://www.hulu.com/', // Hulu
    531: 'https://www.paramountplus.com/', // Paramount+
    350: 'https://tv.apple.com/', // Apple TV+
    29: 'https://www.vudu.com/', // Vudu
    192: 'https://www.youtube.com/movies', // YouTube
    2: 'https://tv.apple.com/', // Apple TV
    3: 'https://play.google.com/store/movies', // Google Play
    358: 'https://www.max.com/' // Max
  };

  const baseUrl = providerLinks[providerId] || `https://www.themoviedb.org/movie/${id}/watch`;
  
  // Special handling for providers that need search parameters
  if (providerId === 3) { // Google Play
    return `${baseUrl}?q=${encodeURIComponent(movieTitle)}`;
  }
  
  return baseUrl;
};

const MovieDetail = () => {
  // Hooks and state
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Movie data state
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Trailer state
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  
  // Rating state
  const { getMovieRating, loading: ratingsLoading } = useRatings();
  const { rateMovie, isRating } = useMovieRating();
  const [currentRating, setCurrentRating] = useState(0);
  
  // Crew state
  const [director, setDirector] = useState(null);
  const [cast, setCast] = useState([]);
  
  // Watch providers state
  const [providers, setProviders] = useState({
    flatrate: [],
    buy: [],
    rent: []
  });

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) {
          throw new Error('TMDB API key not found');
        }
        
        // Fetch movie details with credits and watch providers
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,watch/providers`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        
        const data = await response.json();
        
        // Process movie data
        setMovie(data);
        
        // Extract director
        const movieDirector = data.credits?.crew?.find(
          person => person.job === 'Director'
        );
        setDirector(movieDirector);
        
        // Extract top 3 cast members
        const topCast = data.credits?.cast?.slice(0, 3) || [];
        setCast(topCast);
        
        // Set current rating if exists
        const rating = getMovieRating(data.id)?.rating || 0;
        setCurrentRating(rating);
        
        // Try to fetch trailer
        await fetchTrailer(data);
        
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [id, getMovieRating]);
  
  // Fetch trailer function
  const fetchTrailer = async (movieData) => {
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const trailer = data.results?.find(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        if (trailer?.key) {
          setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`);
        } else {
          // Fallback to OMDb if no trailer found on TMDB
          await fetchOMDbTrailer(movieData);
        }
      }
    } catch (err) {
      console.error('Error fetching trailer:', err);
    }
  };
  
  // Fallback to OMDb for trailer
  const fetchOMDbTrailer = async (movieData) => {
    try {
      const apiKey = import.meta.env.VITE_OMDB_API_KEY;
      if (!apiKey || !movieData?.imdb_id) return;
      
      const response = await fetch(
        `https://www.omdbapi.com/?i=${movieData.imdb_id}&apikey=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data?.Poster) {
          // If no trailer, we can at least use the poster if TMDB doesn't have one
          if (!movie.poster_path) {
            setMovie(prev => ({ ...prev, poster_path: data.Poster }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching OMDb data:', err);
    }
  };

  // Handle rating a movie
  const handleRateMovie = async (rating) => {
    if (isRating || !movie) return;
    
    const newRating = currentRating === rating ? 0 : rating;
    
    try {
      await rateMovie(movie.id, newRating, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
      });
      
      setCurrentRating(newRating);
      
      toast.success(
        newRating > 0 
          ? `Rated ${newRating} star${newRating > 1 ? 's' : ''}!`
          : 'Rating removed'
      );
    } catch (error) {
      console.error('Error rating movie:', error);
      toast.error('Failed to update rating');
    }
  };

  // Toggle trailer modal
  const toggleTrailer = () => {
    setShowTrailer(!showTrailer);
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
  
  // Get watch providers
  const providers = movie['watch/providers']?.results?.US || {};
  const flatrateProviders = providers.flatrate || [];
  const buyProviders = providers.buy || [];
  const rentProviders = providers.rent || [];
  
  // Combine all providers, removing duplicates
  const allProviders = [
    ...new Map([
      ...flatrateProviders,
      ...buyProviders,
      ...rentProviders
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
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
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
                    {movie.certification && (
                      <span className="px-2 py-1 border border-gray-600 rounded">
                        {movie.certification}
                      </span>
                    )}
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
                    
                    {/* Top 3 Cast Members */}
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
                      onClick={toggleTrailer}
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
                      {allProviders.map((provider) => {
                        const providerLinks = {
                          8: 'https://www.netflix.com/', // Netflix
                          9: 'https://www.primevideo.com/', // Amazon Prime Video
                          337: 'https://www.disneyplus.com/', // Disney+
                          15: 'https://www.hulu.com/', // Hulu
                          531: 'https://www.paramountplus.com/', // Paramount+
                          350: 'https://tv.apple.com/', // Apple TV+
                          29: 'https://www.vudu.com/', // Vudu
                          192: 'https://www.youtube.com/movies', // YouTube
                          2: 'https://tv.apple.com/', // Apple TV
                          3: 'https://play.google.com/store/movies', // Google Play
                          358: 'https://www.max.com/' // Max
                        };
                        
                        const providerUrl = providerLinks[provider.provider_id] || `https://www.themoviedb.org/movie/${id}/watch`;
                        
                        return (
                          <a
                            key={provider.provider_id}
                            href={providerUrl}
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
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trailer Modal */}
      {showTrailer && trailerUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={toggleTrailer}
        >
          <div 
            className="relative w-full max-w-6xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={toggleTrailer}
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

// Export the component
export default MovieDetail;
        let trailer = data.results?.find(
          (video) => video.type === 'Trailer' && video.official && video.site === 'YouTube'
        ) || data.results?.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        ) || data.results?.[0];
        
        if (trailer?.key) {
          console.log('Using TMDB trailer:', trailer);
          return `https://www.youtube.com/embed/${trailer.key}`;
        }
      }
    } catch (error) {
      console.error('Error fetching TMDB videos:', error);
    }
    
    // 2. If no TMDB trailer, try OMDb
    console.log('No TMDB trailer found, trying OMDb...');
    try {
      const omdbTrailer = await fetchOMDbTrailer(imdb_id, title, release_date);
      if (omdbTrailer) {
        console.log('Using OMDb trailer/poster:', omdbTrailer);
        return omdbTrailer;
      }
    } catch (error) {
      console.error('Error fetching OMDb trailer:', error);
    }
    
    console.log('No trailer found from any source');
    return null;
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details from TMDB API
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const movieUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,release_dates,watch/providers,external_ids`;
        
        const response = await fetch(movieUrl);
        
        if (!response.ok) {
          throw new Error('Movie not found');
        }
        
        const data = await response.json();
        
        // Log the watch providers data for debugging
        console.log('Watch providers data:', data['watch/providers']);
        
        // Helper function to get providers by region
        const getProvidersForRegion = (region) => {
          const regionData = data['watch/providers']?.results?.[region];
          if (!regionData) return [];
          
          return [
            ...(regionData.flatrate || []).map(p => ({...p, type: 'stream'})),
            ...(regionData.buy || []).map(p => ({...p, type: 'buy'})),
            ...(regionData.rent || []).map(p => ({...p, type: 'rent'})),
          ];
        };
        
        // Try to get providers for US first, then check other regions
        let providers = getProvidersForRegion('US');
        let regionName = 'US';
        
        // If no US providers, try other regions
        if (providers.length === 0) {
          const allRegions = data['watch/providers']?.results ? Object.keys(data['watch/providers'].results) : [];
          
          // Try to find a region with providers
          for (const region of allRegions) {
            const regionProviders = getProvidersForRegion(region);
            if (regionProviders.length > 0) {
              providers = regionProviders;
              regionName = region;
              break;
            }
          }
        }
        
        // Add region info to providers
        providers = providers.map(p => ({
          ...p,
          region: regionName,
          display_priority: p.display_priority || 999
        }));
        
        // Get director from crew
        const director = data.credits?.crew?.find(
          member => member.job === 'Director' || member.department === 'Directing'
        ) || null;

        // Format the movie data to match our component's expectations
        const formattedMovie = {
          id: data.id.toString(),
          title: data.title,
          overview: data.overview,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          vote_average: data.vote_average,
          release_date: data.release_date,
          runtime: data.runtime,
          genres: data.genres || [],
          imdb_id: data.imdb_id, // Include IMDb ID for OMDb fallback
          credits: {
            cast: data.credits?.cast?.slice(0, 4).map(actor => ({
              id: actor.id,
              name: actor.name,
              character: actor.character,
              profile_path: actor.profile_path,
              isDirector: false
            })) || []
          },
          providers: providers.sort((a, b) => {
            // Sort by type first (stream > buy > rent), then by display_priority
            const typeOrder = { stream: 0, buy: 1, rent: 2 };
            return typeOrder[a.type] - typeOrder[b.type] || a.display_priority - b.display_priority;
          })
        };
        
        setMovie(formattedMovie);
        setDirector(director);
        setError(null);
        
        // Fetch movie videos with fallback to OMDb
        const trailerUrl = await fetchMovieVideos({
          id: data.id,
          imdb_id: data.imdb_id,
          title: data.title,
          release_date: data.release_date
        });
        
        if (trailerUrl) {
          setTrailerUrl(trailerUrl);
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('Failed to load movie details');
        // Don't navigate to 404 here, let the component handle the error state
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Toggle trailer visibility
  const toggleTrailer = () => {
    setShowTrailer(!showTrailer);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'Movie not found'}
        </h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10">
        {movie.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover opacity-20"
            onError={(e) => {
              if (e.target) e.target.style.display = 'none';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Movie Poster and Info */}
            <div className="lg:w-1/4">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 shadow-xl">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      if (e.target) e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                    <FaFilm className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle Column - Movie Details */}
            <div className="lg:w-2/4">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl">
                {/* Overview */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-3 text-white flex items-center">
                    <span className="w-8 h-0.5 bg-blue-500 mr-3"></span>
                    Overview
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>

                {/* Cast & Director */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                    <span className="w-8 h-0.5 bg-blue-500 mr-3"></span>
                    Cast & Crew
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Director Card */}
                    {director && (
                      <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-blue-500/30">
                        <div className="w-full aspect-[2/3] bg-blue-900/20 relative">
                          {director.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${director.profile_path}`}
                              alt={director.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e?.target) {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-300">
                              <FaFilm className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <span className="text-xs font-medium text-blue-300">Director</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <Link 
                            to={`/director/${director.id}`}
                            className="font-medium text-white hover:text-blue-400 transition-colors block truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {director.name}
                          </Link>
                          <p className="text-sm text-gray-400">Director</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Cast Cards */}
                    {movie.credits?.cast && movie.credits.cast.slice(0, 3).map((person) => (
                      <div key={person.id} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                        <div className="relative aspect-[2/3] bg-gray-900">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                              alt={person.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e?.target) {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-white truncate">{person.name}</h3>
                          <p className="text-sm text-gray-400 truncate">{person.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-4">
                {/* Your Rating Section */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-lg">
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
                            onClick={async () => {
                              if (isRating) return;
                              const newRating = currentRating === star ? 0 : star;
                              try {
                                await rateMovie(movie.id, newRating, {
                                  id: movie.id,
                                  title: movie.title,
                                  poster_path: movie.poster_path,
                                  release_date: movie.release_date,
                                  overview: movie.overview,
                                });
                                setCurrentRating(newRating);
                                toast.success(
                                  newRating > 0 
                                    ? `Rated ${newRating} star${newRating > 1 ? 's' : ''}!`
                                    : 'Rating removed'
                                );
                              } catch (error) {
                                console.error('Error rating movie:', error);
                                toast.error('Failed to update rating');
                              }
                            }}
                            className={`text-2xl transition-colors ${currentRating >= star ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                            disabled={isRating}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-sm text-gray-400">
                      {currentRating > 0 ? `You rated this ${currentRating} star${currentRating > 1 ? 's' : ''}` : 'Rate this movie'}
                    </span>
                  </div>
                </div>

                {/* Watch Trailer */}
                {trailerUrl && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-lg mt-4">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                      <span className="w-6 h-0.5 bg-red-500 mr-2"></span>
                      Watch Trailer
                    </h2>
                    <button
                      onClick={toggleTrailer}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                      </svg>
                      Play Trailer
                    </button>
                  </div>
                )}

                {/* Where to Watch */}
                {movie.providers?.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-lg mt-4">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                      <span className="w-6 h-0.5 bg-blue-500 mr-2"></span>
                      Where to Watch
                    </h2>
                    <div className="space-y-2">
                      {movie.providers.map((provider, index) => {
                            if (isRating) return;
                            const newRating = currentRating === star ? 0 : star;
                            try {
                              await rateMovie(movie.id, newRating, {
                                id: movie.id,
                                title: movie.title,
                                poster_path: movie.poster_path,
                                release_date: movie.release_date,
                                overview: movie.overview,
                              });
                              setCurrentRating(newRating);
                              toast.success(
                                newRating > 0 
                                  ? `Rated ${newRating} star${newRating > 1 ? 's' : ''}!`
                                  : 'Rating removed'
                              );
                            } catch (error) {
                              console.error('Error rating movie:', error);
                              toast.error('Failed to update rating');
                            }
                          }}
                          className={`text-2xl transition-colors ${currentRating >= star ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                          disabled={isRating}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-sm text-gray-400">
                    {currentRating > 0 ? `You rated this ${currentRating} star${currentRating > 1 ? 's' : ''}` : 'Rate this movie'}
                  </span>
                </div>
              </div>

              {/* Watch Trailer */}
              {trailerUrl && (
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-lg">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                    <span className="w-6 h-0.5 bg-red-500 mr-2"></span>
                    Watch Trailer
                  </h2>
                  <button
                    onClick={toggleTrailer}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                    </svg>
                    Play Trailer
                  </button>
                </div>
              )}
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
                      <>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={async () => {
                                if (isRating) return;
                                
                                const newRating = currentRating === star ? 0 : star;
                                try {
                                  await rateMovie(movie.id, newRating, {
                                    id: movie.id,
                                    title: movie.title,
                                    poster_path: movie.poster_path,
                                    release_date: movie.release_date,
                                    overview: movie.overview,
                                    vote_average: movie.vote_average,
                                  });
                                  // Update local state immediately for better UX
                                  setCurrentRating(newRating);
                                } catch (error) {
                                  console.error('Error rating movie:', error);
                                  toast.error('Failed to update rating');
                                }
                              }}
                              disabled={isRating || !movie.id}
                              className={`p-1 ${isRating ? 'cursor-wait' : 'cursor-pointer'}`}
                              aria-label={`Rate ${star} star`}
                            >
                              <FaStar 
                                className={`${star <= currentRating ? 'text-yellow-400' : 'text-gray-400'} ${isRating ? 'opacity-70' : ''}`}
                                size={24}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                          {currentRating > 0
                            ? `You rated this ${currentRating} star${currentRating === 1 ? '' : 's'}`
                            : 'Rate for better recommendations'}
                        </p>
                      </>
                    )}
                    {currentRating > 0 && (
                      <button
                        onClick={async () => {
                          if (isRating) return;
                          try {
                            await rateMovie(movie.id, 0, {
                              id: movie.id,
                              title: movie.title,
                              poster_path: movie.poster_path,
                              release_date: movie.release_date,
                              overview: movie.overview,
                              vote_average: movie.vote_average,
                            });
                          } catch (error) {
                            console.error('Error removing rating:', error);
                            toast.error('Failed to remove rating');
                          }
                        }}
                        disabled={isRating}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove rating
                      </button>
                    )}
                  </div>
                </div>

              {/* Watch Trailer */}
              {trailerUrl && (
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-lg">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                    <span className="w-6 h-0.5 bg-red-500 mr-2"></span>
                    Watch Trailer
                  </h2>
                  <button
                    onClick={toggleTrailer}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                    </svg>
                    Play Trailer
                  </button>
                </div>
              )}

              {/* Where to Watch */}
              {movie.providers?.length > 0 && (
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-lg">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                    <span className="w-6 h-0.5 bg-blue-500 mr-2"></span>
                    Where to Watch
                  </h2>
                    <div className="space-y-2">
                      {movie.providers.map((provider, index) => {
                        const getInitials = (name) => {
                          return name
                            .split(' ')
                            .map(word => word[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 3);
                        };

                        // Create a mapping of provider IDs to their respective URLs
                        const providerLinks = {
                          8: 'https://www.netflix.com/title/', // Netflix
                          9: 'https://www.primevideo.com/detail/', // Amazon Prime Video
                          337: 'https://www.disneyplus.com/movies/', // Disney+
                          15: 'https://www.hulu.com/movie/', // Hulu
                          531: 'https://www.paramountplus.com/movies/', // Paramount+
                          350: 'https://www.apple.com/tv/', // Apple TV+
                          29: 'https://www.vudu.com/', // Vudu
                          192: 'https://www.youtube.com/movies/', // YouTube
                          2: 'https://tv.apple.com/movie/', // Apple TV
                          3: 'https://play.google.com/store/movies/details/', // Google Play Movies
                          358: 'https://www.max.com/' // Max
                        };

                        // Get the base URL for the provider
                        const getProviderUrl = (providerId, providerName, movieTitle, region) => {
                          const baseUrl = providerLinks[providerId];
                          const tmdbWatchUrl = `https://www.themoviedb.org/movie/${id}/watch?locale=${region}`;
                          
                          // If we have a direct link for this provider, use it
                          if (baseUrl) {
                            // For Netflix, we need to use the TMDB watch page as we can't link directly
                            if (providerId === 8) return tmdbWatchUrl;
                            
                            // For other providers, we can try to link directly
                            return baseUrl;
                          }
                          
                          // Fallback to TMDB watch page with the correct region
                          return tmdbWatchUrl;
                        };

                        const providerUrl = getProviderUrl(
                          provider.provider_id, 
                          provider.provider_name, 
                          movie.title,
                          provider.region || 'US'
                        );
                        
                        return (
                          <a 
                            key={index} 
                            href={providerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block no-underline"
                          >
                            <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors text-sm relative group">
                              <div className="relative w-8 h-8 flex-shrink-0">
                                {provider.logo_path ? (
                                  <>
                                    <img
                                      src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                      alt={provider.provider_name}
                                      className="w-full h-full object-contain p-1 bg-white rounded-md"
                                      onError={(e) => {
                                        if (e?.target) {
                                          e.target.style.display = 'none';
                                          if (e.target.nextElementSibling) {
                                            e.target.nextElementSibling.style.display = 'flex';
                                          }
                                        }
                                      }}
                                    />
                                    <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 rounded">
                                      <span className="text-[10px] font-bold text-white">
                                        {getInitials(provider.provider_name)}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 rounded">
                                    <span className="text-[10px] font-bold text-white">
                                      {getInitials(provider.provider_name)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-white block truncate">{provider.provider_name}</span>
                                {provider.region && provider.region !== 'US' && (
                                  <span className="text-xs text-gray-400 block -mt-0.5">Available in {provider.region}</span>
                                )}
                              </div>
                              <svg className="w-3 h-3 ml-2 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trailer Modal */}
      {showTrailer && trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={toggleTrailer}>
          <div className="relative w-full max-w-6xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={toggleTrailer}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              aria-label="Close trailer"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
