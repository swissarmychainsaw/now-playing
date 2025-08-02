export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  [key: string]: any;
}

export interface SearchResult extends Movie {
  media_type: string; // Making this required for SearchResult
}

export interface MovieDetails extends Movie {
  overview?: string;
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  tagline?: string;
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew?: Array<{
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }>;
  };
  videos?: {
    results?: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
  similar?: {
    results?: Movie[];
  };
}
