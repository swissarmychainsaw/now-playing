import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);

  // Sample movie data - in a real app, this would come from an API
  const sampleMovies = {
    '1': {
      id: '1',
      title: 'The Shawshank Redemption',
      overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
      vote_average: 8.7,
      release_date: '1994-09-23',
      runtime: 142,
      certification: 'R',
      genres: [
        { id: 1, name: 'Drama' },
        { id: 2, name: 'Crime' }
      ],
      credits: {
        cast: [
          { id: 1, name: 'Tim Robbins', character: 'Andy Dufresne', profile_path: '/hsCu1JUzQQ4pl7FxNzPGOMtCKhI.jpg' },
          { id: 2, name: 'Morgan Freeman', character: 'Ellis Boyd "Red" Redding', profile_path: '/oGJQhOpT8S1M56tvSsbEBePV5O1.jpg' },
          { id: 3, name: 'Bob Gunton', character: 'Warden Norton', profile_path: '/yWt2r2QeBQHt0QrXhA5Dx5X7JNB.jpg' },
          { id: 4, name: 'William Sadler', character: 'Heywood', profile_path: '/bSitU6tYzYlJ3R0JkudLh4v81TV.jpg' },
          { id: 5, name: 'Clancy Brown', character: 'Captain Hadley', profile_path: '/1xWuTtSbjV9x1O1d1QCLYt0KB1T.jpg' },
        ]
      },
      providers: [
        {
          provider_name: 'Netflix',
          logo_path: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg'
        }
      ]
    },
    '2': {
      id: '2',
      title: 'The Godfather',
      overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      backdrop_path: '/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg',
      trailer_url: 'https://www.youtube.com/watch?v=sY1S34973zA',
      vote_average: 8.7,
      release_date: '1972-03-24',
      runtime: 175,
      certification: 'R',
      genres: [
        { id: 1, name: 'Drama' },
        { id: 2, name: 'Crime' }
      ],
      credits: {
        cast: [
          { id: 1, name: 'Marlon Brando', character: 'Don Vito Corleone', profile_path: '/fuTEPMsBtV1lE9GR9F0W2SCnxbl.jpg' },
          { id: 2, name: 'Al Pacino', character: 'Michael Corleone', profile_path: '/fMDFeVf0pjopTJbyRSLFwNDm8Wr.jpg' },
          { id: 3, name: 'James Caan', character: 'Sonny Corleone', profile_path: '/vRlHNnKORUR6ALw8n2LUD8tXfDw.jpg' },
          { id: 4, name: 'Robert Duvall', character: 'Tom Hagen', profile_path: '/1g0zYzggj6kl5B8kmH8aYf1QoVn.jpg' },
          { id: 5, name: 'Diane Keaton', character: 'Kay Adams', profile_path: '/qOuvuHx9kQBOHOaJ4a4TQ6FRKQr.jpg' },
        ]
      },
      providers: [
        {
          provider_name: 'Paramount+',
          logo_path: '/gJjVU96FCP35acEa2NGcOX28ilm.jpg'
        }
      ]
    }
  };

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setMovie(sampleMovies[id]);
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
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
      {/* Backdrop and Header */}
      <div className="relative pt-16 pb-8 w-full bg-gray-800">
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
          <div className="flex items-end gap-6">
            <div className="w-32 h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl transform -translate-y-12 border-2 border-white/10 bg-gray-800">
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
              {/* Streaming Providers & Trailer */}
              <div className="space-y-4">
                {/* Watch Trailer Button */}
                {movie.trailer_url && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                      <span className="w-6 h-0.5 bg-red-500 mr-2"></span>
                      Watch Trailer
                    </h2>
                    <a
                      href={movie.trailer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Watch Trailer</span>
                    </a>
                  </div>
                )}

                {/* Streaming Providers */}
                {movie.providers?.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center">
                      <span className="w-6 h-0.5 bg-blue-500 mr-2"></span>
                      Where to Watch
                    </h2>
                    <div className="space-y-2">
                      {movie.providers.map((provider, index) => {
                        // Create initials from provider name
                        const getInitials = (name) => {
                          return name
                            .split(' ')
                            .map(word => word[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 3);
                        };

                        return (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors text-sm">
                            <div className="relative w-8 h-8 flex-shrink-0">
                              {provider.logo_path ? (
                                <>
                                  <img
                                    src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                    alt={provider.provider_name}
                                    className="w-full h-full object-contain p-1 bg-white rounded-md"
                                    onError={(e) => {
                                      // Hide the image and show the fallback if it fails to load
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
                            <span className="font-medium">{provider.provider_name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* User Rating */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <h2 className="text-lg font-bold mb-2 text-white flex items-center">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
