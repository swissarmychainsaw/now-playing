import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as tmdbService from '../../services/tmdb';
import { TmdbMovie } from '../../types/tmdb';

interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  credit_id?: string;
  order?: number;
  gender?: number;
  known_for_department?: string;
  original_name?: string;
  popularity?: number;
  cast_id?: number;
}
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

// Type definitions
interface UserMovieData {
  ratings: Record<number, number>;
  watchlist: Set<number>;
  notInterested: Set<number>;
}

export interface ExtendedCastMember {
  profile_path: string | null;
  credit_id: string;
  order: number;
  character: string;
  name: string;
  id: number;
  gender?: number;
  known_for_department?: string;
  original_name?: string;
  popularity?: number;
  cast_id?: number;
}

export interface ExtendedTmdbMovie {
  credits: {
    cast: ExtendedCastMember[];
  };
  user_rating: number;
  in_watchlist: boolean;
  not_interested: boolean;
  genres: Array<{ id: number; name: string }>;
  tagline: string;
  runtime: number;
  media_type: 'movie';
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  id: number;
  popularity: number;
  original_language: string;
  backdrop_path: string | null;
  original_title: string;
  adult: boolean;
  video: boolean;
  genre_ids: number[];
  name?: string; // For TV shows
  first_air_date?: string; // For TV shows
}

const SearchResults = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [searchResults, setSearchResults] = useState<ExtendedTmdbMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<ExtendedTmdbMovie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [userMovieData, setUserMovieData] = useState<UserMovieData>({
    ratings: {},
    watchlist: new Set(),
    notInterested: new Set()
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const searchInput = form.elements.namedItem('search') as HTMLInputElement;
    const newQuery = searchInput.value.trim();
    if (newQuery) {
      navigate(`/search?query=${encodeURIComponent(newQuery)}`);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserMovieData({
            ratings: data.ratings || {},
            watchlist: new Set(Object.keys(data.watchlist || {}).map(Number)),
            notInterested: new Set(Object.keys(data.notInterested || {}).map(Number))
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Fetch search results when query changes
  useEffect(() => {
    const searchMovies = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSearchError(null);

      try {
        const response = await tmdbService.searchMovies(query);
        const results = Array.isArray(response) ? response : response?.results || [];

        // Enhance results with user data
        const enhancedResults = results.map((movie: TmdbMovie) => {
          // Initialize empty cast array since search results don't include credits by default
          const cast: ExtendedCastMember[] = [];

          return {
            ...movie,
            credits: { cast },
            user_rating: userMovieData.ratings[movie.id] || 0,
            in_watchlist: userMovieData.watchlist.has(movie.id),
            not_interested: userMovieData.notInterested.has(movie.id),
            media_type: 'movie' as const,
            title: movie.title || '',
            overview: movie.overview || '',
            poster_path: movie.poster_path || null,
            release_date: movie.release_date || '',
            vote_average: movie.vote_average || 0,
            vote_count: movie.vote_count || 0,
            id: movie.id,
            popularity: movie.popularity || 0,
            original_language: movie.original_language || 'en',
            backdrop_path: movie.backdrop_path || null,
            original_title: movie.original_title || movie.title || '',
            adult: movie.adult || false,
            video: movie.video || false,
            genre_ids: movie.genre_ids || [],
            genres: [],
            tagline: '',
            runtime: 0
          };
        });

        setSearchResults(enhancedResults);
      } catch (err) {
        console.error('Error searching movies:', err);
        setSearchError('Failed to search movies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchMovies();
  }, [query, userMovieData]);

  const handleMovieSelect = useCallback(async (movie: ExtendedTmdbMovie) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch detailed movie info including credits
      const [details, creditsResponse] = await Promise.all([
        tmdbService.getMovieDetails(movie.id),
        tmdbService.getMovieCredits(movie.id)
      ]);

      // Create properly typed cast array with all required properties
      const cast: ExtendedCastMember[] = [];
      if (creditsResponse.cast) {
        for (const member of creditsResponse.cast) {
          cast.push({
            ...member,
            credit_id: member.credit_id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            order: member.order || 0,
            profile_path: member.profile_path || null,
            character: member.character || '',
            name: member.name || '',
            id: member.id
          });
        }
      }

          // Create enhanced movie object with all required properties
      const enhancedMovie: ExtendedTmdbMovie = {
        ...movie,
        credits: { cast },
        user_rating: userMovieData.ratings[movie.id] || 0,
        in_watchlist: userMovieData.watchlist.has(movie.id),
        not_interested: userMovieData.notInterested.has(movie.id),
        genres: details.genres || [],
        tagline: details.tagline || '',
        runtime: details.runtime || 0,
        media_type: 'movie' as const,
        title: details.title || '',
        overview: details.overview || '',
        release_date: details.release_date || '',
        vote_average: details.vote_average || 0,
        vote_count: details.vote_count || 0,
        id: details.id,
        poster_path: details.poster_path || null,
        backdrop_path: details.backdrop_path || null,
        original_title: details.original_title || '',
        original_language: details.original_language || 'en',
        popularity: details.popularity || 0,
        video: false,
        adult: details.adult || false,
        genre_ids: details.genre_ids || [],
      };

      setSelectedMovie(enhancedMovie);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setError('Failed to load movie details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userMovieData]);

  const handleRateMovie = useCallback(async (movie: ExtendedTmdbMovie, rating: number) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      // Optimistic update
      setUserMovieData(prev => ({
        ...prev,
        ratings: { ...prev.ratings, [movie.id]: rating }
      }));

      // Update selected movie if it's the one being rated
      if (selectedMovie?.id === movie.id) {
        setSelectedMovie(prev => ({
          ...prev!,
          user_rating: rating
        }));
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        [`ratings.${movie.id}`]: rating
      }, { merge: true });
    } catch (err) {
      console.error('Error rating movie:', err);
      // Revert optimistic update on error
      setUserMovieData(prev => ({
        ...prev,
        ratings: { ...prev.ratings, [movie.id]: prev.ratings[movie.id] || 0 }
      }));
    }
  }, [currentUser, selectedMovie, navigate]);

  const handleWatchlistToggle = useCallback(async (movie: ExtendedTmdbMovie) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const isInWatchlist = userMovieData.watchlist.has(movie.id);

      // Optimistic update
      setUserMovieData(prev => ({
        ...prev,
        watchlist: isInWatchlist
          ? new Set([...prev.watchlist].filter(id => id !== movie.id))
          : new Set([...prev.watchlist, movie.id])
      }));

      // Update Firestore
      if (isInWatchlist) {
        await updateDoc(userRef, {
          [`watchlist.${movie.id}`]: deleteField()
        });
      } else {
        await updateDoc(userRef, {
          [`watchlist.${movie.id}`]: true
        });
      }

      // Update selected movie if it's the one being toggled
      setSelectedMovie(prev =>
        prev?.id === movie.id
          ? { ...prev, in_watchlist: !isInWatchlist }
          : prev
      );
    } catch (error) {
      console.error('Error updating watchlist:', error);
      setError('Failed to update watchlist. Please try again.');
      // Revert optimistic update
      setUserMovieData(prev => ({
        ...prev,
        watchlist: new Set([...prev.watchlist])
      }));
    }
  }, [currentUser, navigate, userMovieData.watchlist]);

  const handleMarkNotInterested = useCallback(async (movieId: number) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        [`notInterested.${movieId}`]: true,
      });

      setUserMovieData((prev) => ({
        ...prev,
        notInterested: new Set(prev.notInterested).add(movieId),
      }));

      setSearchResults((prev) => prev.filter((movie) => movie.id !== movieId));
    } catch (error) {
      console.error('Error marking as not interested:', error);
    }
  }, [currentUser, navigate]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const searchInput = form.elements.namedItem('search') as HTMLInputElement;
    const newQuery = searchInput.value.trim();

    if (newQuery) {
      // The search will be triggered by the useEffect that watches the query state
    }
  }, []);

  useEffect(() => {
    const movieId = searchParams.get('movie');
    if (movieId) {
      const id = Number(movieId);
      // Only fetch if the selected movie is different from current
      if (!selectedMovie || selectedMovie.id !== id) {
        const movie = searchResults.find((m) => m.id === id);
        if (movie) {
          handleMovieSelect(movie);
        } else if (id) {
          // If movie not in search results, fetch it
          tmdbService.getMovieDetails(id).then((details) => {
            const movieDetails: ExtendedTmdbMovie = {
              ...details,
              credits: { cast: details.credits?.cast || [] },
              user_rating: userMovieData.ratings[details.id] || 0,
              in_watchlist: userMovieData.watchlist.has(details.id),
              not_interested: userMovieData.notInterested.has(details.id),
              genres: details.genres || [],
              tagline: details.tagline || '',
              runtime: details.runtime || 0,
              overview: details.overview || '',
              poster_path: details.poster_path || null,
              release_date: details.release_date || '',
              vote_average: details.vote_average || 0,
              vote_count: details.vote_count || 0,
              media_type: 'movie' as const,
            };
            setSelectedMovie(movieDetails);
          });
        }
      }
    }
  }, [searchParams, handleMovieSelect, selectedMovie, searchResults, userMovieData]);

  // Render search results
  const renderSearchResults = (): ReactElement => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{searchError}</span>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No results found for "{query}"</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {searchResults.map((movie) => (
          <div
            key={movie.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleMovieSelect(movie)}
          >
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.png'}
              alt={movie.title}
              className="w-full h-64 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/no-poster.png';
              }}
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                <span className="mx-2">•</span>
                <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{movie.overview || 'No overview available.'}</p>
              {movie.in_watchlist && (
                <div className="mt-1 text-sm text-blue-600">In your watchlist</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the selected movie details
  const renderSelectedMovie = (): ReactElement | null => {
    if (!selectedMovie) return null;
    
    // Helper function to safely map cast members with all required properties
    const getSafeCastMembers = (): ExtendedCastMember[] => {
      if (!selectedMovie?.credits?.cast) return [];
      
      return selectedMovie.credits.cast.map((member: TmdbCastMember): ExtendedCastMember => ({
        ...member,
        credit_id: member.credit_id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        order: member.order || 0,
        profile_path: member.profile_path || null,
        character: member.character || '',
        name: member.name || '',
        id: member.id,
        gender: member.gender ?? 0,
        known_for_department: member.known_for_department || '',
        original_name: member.original_name || member.name || '',
        popularity: member.popularity ?? 0,
        cast_id: member.cast_id ?? 0
      }));
    };
    
    const safeCastMembers = getSafeCastMembers();

    return (
      <div className="mb-8">
        <button
          onClick={() => setSelectedMovie(null)}
          className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
        >
          ← Back to results
        </button>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                className="h-96 w-full md:w-64 object-cover"
                src={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : '/no-poster.png'}
                alt={selectedMovie.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/no-poster.png';
                }}
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">
                {selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'N/A'}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{selectedMovie.title}</h1>
              <div className="mt-2">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="text-gray-600 text-lg ml-1">
                  {selectedMovie.vote_average?.toFixed(1) || 'N/A'}
                  <span className="text-gray-500 text-sm ml-1">({selectedMovie.vote_count} votes)</span>
                </span>
              </div>
              <div className="mt-4">
                {selectedMovie.genres?.map(genre => (
                  <span key={genre.id} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Cast</h3>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {safeCastMembers.slice(0, 10).map((person) => (
                    <div key={`${person.id}-${person.credit_id}`} className="flex-shrink-0 w-24 text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-white text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{person.name}</p>
                      <p className="text-xs text-gray-500 truncate">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-gray-600">{selectedMovie.overview}</p>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Top Cast</h3>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {safeCastMembers.slice(0, 10).map((cast) => (
                    <div key={`${cast.id}-${cast.credit_id}`} className="flex-shrink-0 text-center">
                      <img
                        src={cast.profile_path ? `https://image.tmdb.org/t/p/w200${cast.profile_path}` : '/no-avatar.png'}
                        alt={cast.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/no-avatar.png';
                        }}
                      />
                      <p className="text-sm font-medium mt-1">{cast.name}</p>
                      <p className="text-xs text-gray-500">{cast.character}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => handleRateMovie(selectedMovie, 10)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedMovie.user_rating === 10
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ★
                </button>
                <button
                  onClick={() => handleWatchlistToggle(selectedMovie)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedMovie.in_watchlist
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {selectedMovie.in_watchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
                <button
                  onClick={() => handleMarkNotInterested(selectedMovie.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Not Interested
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="flex">
          <input
            type="text"
            name="search"
            defaultValue={query}
            className="flex-grow p-2 border border-gray-300 rounded-l"
            placeholder="Search for movies..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Search
          </button>
        </form>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : searchError ? (
        <div className="text-center py-8 text-red-500">
          <p>Error: {searchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : selectedMovie ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={() => setSelectedMovie(null)}
            className="mb-4 text-blue-500 hover:underline"
          >
            &larr; Back to results
          </button>
          {renderSelectedMovie()}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.length > 0 ? (
            searchResults.map((movie) => (
              <div
                key={movie.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="relative">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  {userMovieData.watchlist.has(movie.id) && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                      Watchlist
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                    <span className="mx-2">•</span>
                    <span>{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {movie.genre_ids.slice(0, 3).map((genreId) => (
                      <span
                        key={genreId}
                        className="bg-gray-100 text-xs px-2 py-1 rounded"
                      >
                        {genreId}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {movie.overview}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
        <form onSubmit={handleSearchSubmit} className="flex">
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search for movies..."
            className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>
      
      {selectedMovie ? renderSelectedMovie() : renderSearchResults()}
    </div>
  );
};
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="flex">
          <input
            type="text"
            name="search"
            defaultValue={query}
            placeholder="Search for movies..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          {query ? `Search Results for "${query}"` : 'Search Results'}
          {searchResults.length > 0 && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              ({searchResults.length} {searchResults.length === 1 ? 'result' : 'results'})
            </span>
          )}
        </h2>
      </div>

      {selectedMovie ? renderSelectedMovie() : renderSearchResults()}
    </div>
  );

};

export default SearchResults;
