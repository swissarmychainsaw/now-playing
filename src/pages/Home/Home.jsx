import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../../components/SearchBox/SearchBox';
import RecommendationTabs from '../../components/RecommendationTabs/RecommendationTabs';
import MovieCard from '../../components/MovieCard/MovieCard';
import { useUser } from '../../context/UserContext';

// Sample list of recent Oscar winners (in a real app, you'd want to fetch this)
const oscarWinners = [
  { title: 'Nomadland', year: 2021 },
  { title: 'Parasite', year: 2020 },
  { title: 'Green Book', year: 2019 },
  { title: 'The Shape of Water', year: 2018 },
  { title: 'Moonlight', year: 2017 },
  { title: 'Spotlight', year: 2016 },
  { title: 'Birdman', year: 2015 },
  { title: '12 Years a Slave', year: 2014 },
  { title: 'Argo', year: 2013 },
  { title: 'The Artist', year: 2012 },
  // Add more Oscar winners as needed
];

const Home = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forYou');
  const [popularPage, setPopularPage] = useState(1);
  const [criticsPage, setCriticsPage] = useState(1);
  const [oscarPage, setOscarPage] = useState(0);
  
  // Hooks
  const { user, ratings, rateMovie } = useUser();
  const hasRatings = Object.keys(ratings).length > 0;
  
  // Handle rating a movie
  const handleRateMovie = useCallback(async (movieId, rating) => {
    try {
      await rateMovie(movieId, rating);
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  }, [rateMovie]);

  // Generate a random page number between 1 and 10 to get different results
  const getRandomPage = useCallback(() => Math.floor(Math.random() * 10) + 1, []);

  // Fetch movies based on active tab
  const fetchMovies = useCallback(async (tab = activeTab, options = {}) => {
    console.log('Fetching movies for tab:', tab, 'with options:', options);
    setLoading(true);
    try {
      let data = [];
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      console.log('API Key:', apiKey ? 'Found' : 'Not found');
      let url = '';
      
      // If this is a new tab click, generate a new random page
      const page = options.page || getRandomPage();
      
      switch(tab) {
        case 'forYou':
          // Show top rated movies with random page for variety
          url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=${page}&language=en-US`;
          break;
        case 'oscarWinners':
          // Filter for Oscar winning movies
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_awards=true&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=1000&page=${page}&language=en-US`;
          break;
        case 'popular':
          url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}&language=en-US`;
          break;
        case 'criticsPicks':
          // Movies with high ratings and vote counts (critics picks)
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&vote_average.gte=7.5&vote_count.gte=500&sort_by=vote_average.desc&page=${page}&language=en-US`;
          break;
        default:
          url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}&language=en-US`;
      }
      
      console.log('Fetching URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Received data:', result);
      // Limit to 5 movies from the API response
      data = (result.results || []).slice(0, 5);
      console.log('Processed movies:', data.length);
      
      // Format movie data to match our expected format
      data = data.map(movie => {
        // Check if this is an Oscar winner (simplified check - in a real app, you'd want a more reliable way)
        const isOscarWinner = tab === 'oscarWinners' || 
          (movie.awards && movie.awards.toLowerCase().includes('oscar')) ||
          (movie.title && oscarWinners.some(winner => 
            winner.title.toLowerCase() === movie.title.toLowerCase() && 
            winner.year === new Date(movie.release_date).getFullYear()
          ));

        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          release_date: movie.release_date,
          poster_path: movie.poster_path, // Keep the original path for the MovieCard component to handle
          posterPath: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/300x450?text=No+Poster',
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          genre_ids: movie.genre_ids || [],
          is_oscar_winner: isOscarWinner,
          // Add additional fields that might be needed
          original_language: movie.original_language,
          // Add release year as a separate field for easier access
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
          // Add genre names if available (you might need to fetch these separately)
          genre_names: movie.genres ? movie.genres.map(g => g.name) : []
        };
      });
      
      setMovies(prevMovies => options.append ? [...prevMovies, ...data] : data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Handlers
  const handleTabChange = useCallback((tab) => {
    // Only update if it's a different tab
    if (tab !== activeTab) {
      setActiveTab(tab);
      // Clear current movies immediately to show loading state
      setMovies([]);
      // Reset page counters when changing tabs
      if (tab === 'popular') setPopularPage(1);
      if (tab === 'criticsPicks') setCriticsPage(1);
      if (tab === 'oscarWinners') setOscarPage(1);
    } else {
      // If clicking the same tab, refresh with new random movies
      setMovies([]);
      if (tab === 'popular') setPopularPage(prev => prev + 1);
      if (tab === 'criticsPicks') setCriticsPage(prev => prev + 1);
      if (tab === 'oscarWinners') setOscarPage(prev => prev + 1);
    }
  }, [activeTab]);

  const handleLoadMore = useCallback(() => {
    if (activeTab === 'popular') {
      const nextPage = popularPage + 1;
      setPopularPage(nextPage);
      fetchMovies('popular', { page: nextPage, append: true });
    } else if (activeTab === 'criticsPicks') {
      const nextPage = criticsPage + 1;
      setCriticsPage(nextPage);
      fetchMovies('criticsPicks', { page: nextPage, append: true });
    } else if (activeTab === 'oscarWinners') {
      const nextPage = oscarPage + 1;
      setOscarPage(nextPage);
      fetchMovies('oscarWinners', { page: nextPage, append: true });
    }
  }, [activeTab, popularPage, criticsPage, oscarPage, fetchMovies]);

  // Effects
  useEffect(() => {
    fetchMovies();
  }, [activeTab, popularPage, criticsPage, oscarPage]); // Refetch when tab or page changes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-800">
            Rate movies to get recommendations
          </h1>
          <p className="text-gray-600 mb-6">
            Search by title, genre, or actor
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBox 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search for movies..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        <RecommendationTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isLoading={loading}
          tabConfig={[
            { id: 'forYou', label: 'For You' },
            { id: 'oscarWinners', label: 'Oscar Winners' },
            { id: 'popular', label: 'Popular' },
            { id: 'criticsPicks', label: 'Critics\' Picks' },
          ]}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
            // Loading state
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded shadow animate-pulse h-96" />
            ))
          ) : (
            // Movie list - limit to 5 movies
            movies.slice(0, 5).map(movie => {
              // Get the user's rating for this movie
              const userRating = ratings[movie.id]?.rating || 0;
              return (
                <MovieCard 
                  key={movie.id}
                  movie={{
                    ...movie,
                    user_rating: userRating
                  }}
                  showRating={true}
                  onRate={handleRateMovie}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
