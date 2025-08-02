// Import the JavaScript implementation
import * as tmdbJs from './tmdb.js';
import { TmdbMovie as TmdbMovieBase, TmdbPaginatedResponse, TmdbCredits, TmdbGenre, TmdbWatchProviders, TmdbVideo } from '../types/tmdb';

// Re-export types
export type { TmdbPaginatedResponse, TmdbCredits, TmdbGenre, TmdbWatchProviders, TmdbVideo };

export interface TmdbMovie extends TmdbMovieBase {
  media_type: 'movie';
  user_rating?: number;
  in_watchlist?: boolean;
  not_interested?: boolean;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string | null;
    }>;
  };
  genres?: Array<{
    id: number;
    name: string;
  }>;
  runtime?: number | null;
  recommendations?: TmdbMovie[];
  tagline?: string;
}

// Define function interfaces
export interface SearchOptions {
  page?: number;
  language?: string;
  includeAdult?: boolean;
  signal?: AbortSignal;
}

export interface DiscoverOptions {
  page?: number;
  language?: string;
  includeAdult?: boolean;
  sortBy?: string;
  withCast?: string;
  withCrew?: string;
  withGenres?: string;
}

export interface RecommendationOptions {
  page?: number;
  language?: string;
}

// Export all TMDB service functions with proper TypeScript types
export const searchMovies = async (
  query: string,
  options: SearchOptions = {}
): Promise<TmdbPaginatedResponse<TmdbMovie>> => {
  return tmdbJs.searchMovies(query, options);
};

export const getMovieDetails = async (movieId: number): Promise<TmdbMovie> => {
  return tmdbJs.getMovieDetails(movieId);
};

export const getMovieCredits = async (movieId: number): Promise<TmdbCredits> => {
  return tmdbJs.getMovieCredits(movieId);
};

export const getMovieRecommendations = async (
  movieId: number,
  options: RecommendationOptions = {}
): Promise<TmdbPaginatedResponse<TmdbMovie>> => {
  return tmdbJs.getRecommendations(movieId, options);
};

export const getMovieGenres = async (): Promise<{ genres: TmdbGenre[] }> => {
  return tmdbJs.getMovieGenres();
};

export const getMovieWatchProviders = async (movieId: number): Promise<TmdbWatchProviders> => {
  return tmdbJs.getMovieWatchProviders(movieId);
};

export const getMovieVideos = async (movieId: number): Promise<{ results: TmdbVideo[] }> => {
  return tmdbJs.getMovieVideos(movieId);
};

export const getPopularMovies = async (options: RecommendationOptions = {}): Promise<TmdbPaginatedResponse<TmdbMovie>> => {
  return tmdbJs.getPopularMovies(options);
};

export const discoverMovies = async (options: DiscoverOptions = {}): Promise<TmdbPaginatedResponse<TmdbMovie>> => {
  return tmdbJs.discoverMovies(options);
};

export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all', timeWindow: 'day' | 'week' = 'day') => {
  return tmdbJs.getTrending(mediaType, timeWindow);
};

export const getConfiguration = async () => {
  return tmdbJs.getConfiguration();
};
