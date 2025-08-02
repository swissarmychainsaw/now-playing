import { TmdbMovie, TmdbCastMember, TmdbGenre, TmdbMovieDetails } from './tmdb';

export interface ExtendedMovie extends TmdbMovie {
  media_type: 'movie';
  user_rating?: number;
  in_watchlist?: boolean;
  not_interested?: boolean;
  credits?: {
    cast: Array<TmdbCastMember & { profile_path?: string | null }>;
  };
  genres?: TmdbGenre[];
  runtime?: number | null;
  recommendations?: ExtendedMovie[];
  tagline?: string;
}

export interface UserMovieData {
  ratings: Record<number, number>;
  watchlist: Set<number>;
  notInterested: Set<number>;
}
