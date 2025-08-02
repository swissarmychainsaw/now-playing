import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import tmdbService from '../../services/tmdb';
import { TmdbMovie, TmdbTvShow, TmdbPerson, TmdbPaginatedResponse } from '../../types/tmdb';
import './SearchResults.css';

type MediaType = 'movie' | 'tv' | 'person';

interface SearchResultBase {
  id: number;
  media_type: MediaType;
  popularity: number;
}

interface MovieSearchResult extends Omit<TmdbMovie, 'media_type'> {
  media_type: 'movie';
  title: string;
  release_date?: string;
}

interface TvShowSearchResult extends Omit<TmdbTvShow, 'media_type'> {
  media_type: 'tv';
  name: string;
  first_air_date?: string;
}

interface KnownForItem {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path: string | null;
  vote_average?: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
}

interface PersonSearchResult extends Omit<TmdbPerson, 'media_type' | 'known_for'> {
  media_type: 'person';
  known_for?: KnownForItem[];
}

type SearchResult = MovieSearchResult | TvShowSearchResult | PersonSearchResult;

// Extend the TMDB service type
declare module '../../services/tmdb' {
  interface TmdbService {
    searchMovies(
      query: string,
      options?: { page?: number; includeAdult?: boolean }
    ): Promise<TmdbPaginatedResponse<SearchResult>>;
  }
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSearchResults = useCallback(async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search for movies
      const [moviesResponse, tvResponse, peopleResponse] = await Promise.all([
        (tmdbService as any).searchMovies(query, { 
          page: 1,
          includeAdult: false,
        }),
        (tmdbService as any).searchTvShows?.(query, {
          page: 1,
          includeAdult: false,
        }) || { results: [] },
        (tmdbService as any).searchPeople?.(query, {
          page: 1,
          includeAdult: false,
        }) || { results: [] }
      ]);

      // Combine and format results
      const combinedResults = [
        ...(moviesResponse?.results?.map((movie: any) => ({ ...movie, media_type: 'movie' })) || []),
        ...((tvResponse?.results?.map((show: any) => ({ ...show, media_type: 'tv' }))) || []),
        ...((peopleResponse?.results?.map((person: any) => ({ ...person, media_type: 'person' }))) || [])
      ];
      
      console.log('Combined Search Results:', combinedResults);
      setSearchResults(combinedResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch search results. Please try again later.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // Fetch results when query changes
  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Fetch results when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 500); // Add debounce to prevent too many API calls

    return () => clearTimeout(timer);
  }, [query, fetchSearchResults]);

  const getTitle = (item: SearchResult) => {
    if ('title' in item) return item.title;
    return item.name || 'Untitled';
  };

  const getReleaseYear = (item: SearchResult) => {
    if ('release_date' in item && item.release_date) {
      return new Date(item.release_date).getFullYear();
    }
    if ('first_air_date' in item && item.first_air_date) {
      return new Date(item.first_air_date).getFullYear();
    }
    return null;
  };

  const renderMediaCard = (item: MovieSearchResult | TvShowSearchResult) => {
    if (!item) return null;
    
    console.log('Rendering item:', item); // Debug log
    
    const year = getReleaseYear(item);
    const title = getTitle(item);
    const mediaType = item?.media_type?.toUpperCase?.() || 'UNKNOWN';
    const posterPath = item && 'poster_path' in item ? item.poster_path : null;
    const overview = item && 'overview' in item ? item.overview : null;
    const voteAverage = item && 'vote_average' in item ? Number(item.vote_average) || 0 : 0;
    
    console.log('Parsed values:', { year, title, mediaType, posterPath, overview, voteAverage }); // Debug log

    return (
      <div 
        key={`${item.media_type}-${item.id}`} 
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1"
      >
        {posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            className="w-full h-80 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2" title={title}>
            {title}
          </h3>
          
          <div className="flex justify-between items-center mb-2">
            {year && (
              <span className="text-gray-600 text-sm">{year}</span>
            )}
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {mediaType}
            </span>
          </div>
          
          {overview && (
            <p className="text-gray-700 text-sm line-clamp-3 mb-2" title={overview}>
              {overview}
            </p>
          )}
          
          {voteAverage > 0 && (
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center text-yellow-600 font-medium">
                ★ {voteAverage.toFixed(1)}/10
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPersonCard = (person: PersonSearchResult | null) => {
    if (!person) return null;
    const knownFor = person.known_for?.slice(0, 2).map(item => (
      <div key={item.id} className="text-xs text-gray-600 truncate">
        {item.title || item.name}
      </div>
    ));

    return (
      <div 
        key={`person-${person.id}`}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1"
      >
        {person.profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
            alt={person.name}
            className="w-full h-80 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{person.name}</h3>
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mb-2">
            PERSON
          </span>
          {knownFor && knownFor.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Known for:</p>
              <div className="space-y-1 mt-1">
                {knownFor}
                {person.known_for && person.known_for.length > 2 && (
                  <div className="text-xs text-gray-500">+{person.known_for.length - 2} more</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="search-results container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-blue-600">{query}</span>
      </h1>
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {!isLoading && searchResults.length === 0 && query && !error && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No results found for "{query}"</p>
          <p className="text-gray-500 mt-2">Try different keywords or check your spelling.</p>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResults.map((item) => 
            item?.media_type === 'person' 
              ? renderPersonCard(item as PersonSearchResult) 
              : item && (item.media_type === 'movie' || item.media_type === 'tv')
                ? renderMediaCard(item as MovieSearchResult | TvShowSearchResult)
                : null
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
