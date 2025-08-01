export interface SearchBarProps {
  /** Initial search query value */
  initialQuery?: string;
  
  /** Callback function called when a search is submitted */
  onSearch?: (query: string) => void;
  
  /** Whether the search is currently loading */
  isLoading?: boolean;
  
  /** Additional CSS class name */
  className?: string;
  
  /** Whether to show search suggestions */
  showSuggestions?: boolean;
  
  /** Placeholder text for the search input */
  placeholder?: string;
}

export interface MovieSuggestion {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv' | 'person';
  [key: string]: any; // Allow additional properties
}
