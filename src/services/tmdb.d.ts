import { 
  TmdbMovie, 
  TmdbTvShow, 
  TmdbPaginatedResponse, 
  TmdbMovieDetails, 
  TmdbCredits,
  TmdbRecommendations,
  TmdbPerson
} from '../types/tmdb';

export interface SearchOptions {
  page?: number;
  language?: string;
  includeAdult?: boolean;
  signal?: AbortSignal;
}

export interface TmdbService {
  // Movie methods
  getMovieDetails(movieId: number): Promise<TmdbMovieDetails>;
  getMovieCredits(movieId: number): Promise<TmdbCredits>;
  getRecommendations(movieId: number): Promise<TmdbPaginatedResponse<TmdbMovie>>;
  
  // Search methods
  searchMovies(
    query: string, 
    options?: SearchOptions
  ): Promise<TmdbPaginatedResponse<TmdbMovie | TmdbTvShow | TmdbPerson>>;
  
  // Other methods
  getPopularMovies(options?: any): Promise<TmdbPaginatedResponse<TmdbMovie>>;
  getMovieRecommendations(movieId: number, options?: any): Promise<TmdbPaginatedResponse<TmdbMovie>>;
}

declare const tmdbService: TmdbService;

export default tmdbService;
