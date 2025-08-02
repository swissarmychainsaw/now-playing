// Base response interface for paginated results
export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Movie/TV Show base interface
export interface TmdbMediaBase {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

// Movie interface
export interface TmdbMovie extends TmdbMediaBase {
  title: string;
  original_title: string;
  release_date?: string;
  video: boolean;
  adult: boolean;
}

// TV Show interface
export interface TmdbTvShow extends TmdbMediaBase {
  name: string;
  original_name: string;
  first_air_date?: string;
  origin_country: string[];
}

// Person interface
export interface TmdbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  adult: boolean;
  popularity: number;
  known_for: Array<TmdbMovie | TmdbTvShow>;
}

// Credits
export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  credit_id: string;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

export interface TmdbCredits {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

// Movie Details
export interface TmdbMovieDetails extends TmdbMovie {
  belongs_to_collection: null | {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
  budget: number;
  genres: Array<{
    id: number;
    name: string;
  }>;
  homepage: string;
  imdb_id: string | null;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
  video: boolean;
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      size: number;
      type: string;
      official: boolean;
    }>;
  };
  credits?: TmdbCredits;
}

// Recommendations
export interface TmdbRecommendations {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

// Genre
export interface TmdbGenre {
  id: number;
  name: string;
}

// Video
export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
}

// Watch Providers
export interface TmdbWatchProviders {
  id: number;
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: Array<{
        display_priority: number;
        logo_path: string;
        provider_id: number;
        provider_name: string;
      }>;
      rent?: Array<{
        display_priority: number;
        logo_path: string;
        provider_id: number;
        provider_name: string;
      }>;
      buy?: Array<{
        display_priority: number;
        logo_path: string;
        provider_id: number;
        provider_name: string;
      }>;
    };
  };
}
