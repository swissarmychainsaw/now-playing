import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(null);

  // Function to fetch trailer from OMDb
  const fetchOMDbTrailer = async (imdbId, title, year) => {
    try {
      const apiKey = import.meta.env.VITE_OMDB_API_KEY;
      if (!apiKey) {
        console.error('OMDb API key not found');
        return null;
      }

      // Try with IMDb ID first if available
      if (imdbId) {
        const response = await fetch(
          `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
            // OMDb returns YouTube video IDs in the format: https://www.youtube.com/watch?v=VIDEO_ID
            // We need to extract the video ID and format it for embedding
            if (data.Website && data.Website.includes('youtube.com')) {
              const videoId = data.Website.split('v=')[1];
              if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
              }
            }
            // If no YouTube link, return the poster as fallback
            return data.Poster;
          }
        }
      }

      // Fallback to search by title and year
      if (title) {
        const searchTitle = encodeURIComponent(title);
        const searchYear = year ? `&y=${new Date(year).getFullYear()}` : '';
        const searchResponse = await fetch(
          `https://www.omdbapi.com/?t=${searchTitle}${searchYear}&apikey=${apiKey}`
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.Response === 'True' && searchData.Website && searchData.Website.includes('youtube.com')) {
            const videoId = searchData.Website.split('v=')[1];
            if (videoId) {
              return `https://www.youtube.com/embed/${videoId}`;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching from OMDb:', error);
      return null;
    }
  };

  // Fetch movie videos with fallback to OMDb
  const fetchMovieVideos = async (movieData) => {
    const { id, imdb_id, title, release_date } = movieData;
    
    // 1. First try TMDB
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('TMDB Videos:', data.results);
        
        // Try to find the best possible trailer
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
            cast: data.credits?.cast?.slice(0, 5).map(actor => ({
              id: actor.id,
              name: actor.name,
              character: actor.character,
              profile_path: actor.profile_path
            })) || []
          },
          providers: providers.sort((a, b) => {
            // Sort by type first (stream > buy > rent), then by display_priority
            const typeOrder = { stream: 0, buy: 1, rent: 2 };
            return typeOrder[a.type] - typeOrder[b.type] || a.display_priority - b.display_priority;
          })
        };
        
        setMovie(formattedMovie);
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
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      {/* Backdrop and Header */}
      <div className="relative pt-24 pb-8 w-full bg-gray-800 -mt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800">
            {movie.backdrop_path && (
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                className="w-full h-full object-cover opacity-30"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
        </div>
        
        {/* Movie Header */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-end gap-6 pt-8">
            <div className="w-32 h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-white/10 bg-gray-800">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} Poster`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full ${movie.poster_path ? 'hidden' : 'flex'} items-center justify-center text-gray-400`}>
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="pb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {movie.title}
                <span className="font-normal text-gray-300 ml-2">
                  ({new Date(movie.release_date).getFullYear()})
                </span>
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                <span>{movie.runtime} min</span>
                <span>•</span>
                <span>{movie.certification || 'NR'}</span>
                <span>•</span>
                <span>{movie.vote_average ? `${Math.round(movie.vote_average * 10)}%` : 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genres?.slice(0, 3).map(genre => (
                  <span key={genre.id} className="px-2 py-1 bg-blue-600/30 text-blue-100 text-xs rounded-full border border-blue-500/30">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="lg:w-2/3">
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

              {/* Cast */}
              {movie.credits?.cast?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                    <span className="w-8 h-0.5 bg-blue-500 mr-3"></span>
                    Top Cast
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movie.credits.cast.slice(0, 5).map(person => (
                      <div key={person.id} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
                        <div className="w-full aspect-[2/3] bg-gray-700 relative">
                          <img
                            src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : ''}
                            alt={person.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If image fails to load, replace with fallback UI
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center text-gray-400 bg-gray-800">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-white truncate">{person.name}</h3>
                          <p className="text-sm text-gray-400 truncate">{person.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:w-1/3">
              <div className="space-y-4">
                {/* Rate this Movie */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                    <span className="w-6 h-0.5 bg-blue-500 mr-2"></span>
                    Rate this Movie
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= (userRating || 0) 
                              ? 'text-yellow-400' 
                              : 'text-gray-600 hover:text-yellow-400'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      Your ratings improve our recommendations!
                    </p>
                    {userRating && (
                      <p className="text-green-400 text-sm font-medium mt-1">
                        You rated: {userRating} {userRating === 1 ? 'star' : 'stars'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Watch Trailer */}
                {trailerUrl && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                      <span className="w-6 h-0.5 bg-red-500 mr-2"></span>
                      Watch Trailer
                    </h2>
                    <button
                      onClick={toggleTrailer}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Watch Trailer</span>
                    </button>
                    {showTrailer && trailerUrl && (
                      <div className="mt-4 aspect-video w-full bg-black rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={trailerUrl}
                          title={`${movie.title} Trailer`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        ></iframe>
                      </div>
                    )}
                  </div>
                )}

                {/* Where to Watch */}
                {movie.providers?.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
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
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextElementSibling;
                                        if (fallback) fallback.style.display = 'flex';
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      {/* Backdrop and Header */}
      <div className="relative pb-8 w-full bg-gray-800 -mt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800">
            {movie.backdrop_path && (
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                className="w-full h-full object-cover opacity-30"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
        </div>
        
        {/* Movie Header */}
        <div className="container mx-auto px-4 relative z-10">
          {trailerUrl && (
            <div className="absolute -top-20 right-4 md:right-8">
              <button
                onClick={toggleTrailer}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Trailer
              </button>
            </div>
          )}
          
          {/* Rest of the movie details */}
          <div className="flex items-end gap-6">
            <div className="w-32 h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl transform -translate-y-12 border-2 border-white/10 bg-gray-800">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} poster`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-movie.png';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No poster</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center flex-wrap gap-2 text-sm text-gray-300 mb-4">
                <span>{new Date(movie.release_date).getFullYear()}</span>
                {movie.runtime && <span>• {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
                {movie.certification && <span>• {movie.certification}</span>}
                <span>• {movie.vote_average.toFixed(1)}/10</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map(genre => (
                  <span key={genre.id} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-300 mb-6">{movie.overview}</p>
              
              <div className="flex items-center gap-4">
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </button>
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
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
