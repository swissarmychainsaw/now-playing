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

declare module '../../services/tmdb' {
  interface ITmdbService {
    // Existing methods
    getMovieDetails(movieId: number): Promise<TmdbMovieDetails>;
    getMovieCredits(movieId: number): Promise<TmdbCredits>;
    
    // Search methods
    searchMovies(
      query: string, 
      options?: SearchOptions
    ): Promise<TmdbPaginatedResponse<TmdbMovie | TmdbTvShow | TmdbPerson>>;
    
    // Other methods
    getMovieRecommendations(movieId: number, options?: any): Promise<TmdbRecommendations>;
    getPopularMovies(options?: any): Promise<TmdbPaginatedResponse<TmdbMovie>>;
  }

  const tmdbService: ITmdbService;
  export default tmdbService;
}
