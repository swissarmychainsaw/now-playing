import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../../components/SearchBox/SearchBox';
import RecommendationTabs from '../../components/RecommendationTabs/RecommendationTabs';
import MovieCard from '../../components/MovieCard/MovieCard';
import { useAuth } from '../../context/AuthContext';
import { useRatings } from '../../context/RatingsContext';
import { saveRating } from '../../services/ratings';

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
  const { user } = useAuth();
  const { ratings } = useRatings();
  const hasRatings = Object.keys(ratings).length > 0;
  
  // Generate a random page number between 1 and 10 to get different results
  const getRandomPage = useCallback(() => Math.floor(Math.random() * 10) + 1, []);
  
  // Fetch a single new movie
  const fetchNewMovie = useCallback(async (tab) => {
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let url = '';
      
      // Use a random page to get different results
      const page = getRandomPage();
      
      switch(tab) {
        case 'forYou':
          url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=${page}&language=en-US`;
          break;
        case 'oscarWinners':
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_awards=true&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=1000&page=${page}&language=en-US`;
          break;
        case 'popular':
          url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}&language=en-US`;
          break;
        case 'criticsPicks':
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&vote_average.gte=7.5&vote_count.gte=500&sort_by=vote_average.desc&page=${page}&language=en-US`;
          break;
        default:
          return null;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch new movie: ${response.status}`);
      }
      
      const result = await response.json();
      const newMovie = result.results?.[0];
      
      if (!newMovie) return null;
      
      // Format the movie data to match our expected format
      return {
        id: newMovie.id,
        title: newMovie.title,
        overview: newMovie.overview,
        release_date: newMovie.release_date,
        poster_path: newMovie.poster_path,
        posterPath: newMovie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${newMovie.poster_path}` 
          : 'https://via.placeholder.com/300x450?text=No+Poster',
        vote_average: newMovie.vote_average,
        vote_count: newMovie.vote_count,
        genre_ids: newMovie.genre_ids || [],
        year: newMovie.release_date ? new Date(newMovie.release_date).getFullYear() : null,
        genre_names: newMovie.genres ? newMovie.genres.map(g => g.name) : []
      };
      
    } catch (error) {
      console.error('Error fetching new movie:', error);
      return null;
    }
  }, [getRandomPage]);
  
  // Handle rating a movie and replace it with a new recommendation
  const handleRateMovie = useCallback(async (movieId, rating, movieData) => {
    try {
      // Get the index of the movie being rated
      const movieIndex = movies.findIndex(m => m.id === movieId);
      if (movieIndex === -1) return;
      
      // Save the rating using the saveRating function
      if (!user?.uid) {
        console.error('Cannot save rating: No user is signed in');
        return;
      }
      
      // Use the provided movieData or find the movie in the movies array
      const movieToRate = movieData || movies.find(m => m.id === movieId);
      if (!movieToRate) {
        console.error('Movie not found:', movieId);
        return;
      }
      
      await saveRating(user.uid, movieId, rating, {
        id: movieId,
        title: movieToRate.title,
        poster_path: movieToRate.poster_path,
        release_date: movieToRate.release_date,
        overview: movieToRate.overview,
        vote_average: movieToRate.vote_average,
      });
      
      // Only replace the movie if it's in the "For You" tab
      if (activeTab === 'forYou') {
        // Fetch a new movie to replace the rated one
        const newMovie = await fetchNewMovie(activeTab);
        
        if (newMovie) {
          // Replace the rated movie with the new one
          setMovies(prevMovies => {
            const newMovies = [...prevMovies];
            newMovies[movieIndex] = newMovie;
            return newMovies;
          });
        }
      }
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  }, [user?.uid, movies, activeTab, fetchNewMovie]);

  // Fetch movies based on active tab
  const fetchMovies = useCallback(async (tab = activeTab, options = {}) => {
    console.log('Fetching movies for tab:', tab, 'with options:', options);
    setLoading(true);
    try {
      let data = [];
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      console.log('API Key:', apiKey ? 'Found' : 'Not found');
      let url = '';
      
      // Determine which page to use based on the tab
      let page = options.page;
      if (!page) {
        // If no page is provided in options, use the appropriate page state
        switch(tab) {
          case 'popular':
            page = popularPage;
            break;
          case 'criticsPicks':
            page = criticsPage;
            break;
          case 'oscarWinners':
            page = oscarPage;
            break;
          default:
            // For 'forYou' tab or any other tab, use a random page
            page = getRandomPage();
        }
      }
      
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
    // Always clear current movies immediately to show loading state
    setMovies([]);
    
    // Always update the active tab to ensure UI updates
    setActiveTab(tab);
    
    // For the 'For You' tab, always use a new random page
    if (tab === 'forYou') {
      fetchMovies(tab, { page: getRandomPage() });
      return;
    }
    
    // For other tabs, increment the page counter to get new movies
    if (tab === 'popular') {
      setPopularPage(prev => {
        const newPage = prev + 1;
        fetchMovies(tab, { page: newPage });
        return newPage;
      });
    } else if (tab === 'criticsPicks') {
      setCriticsPage(prev => {
        const newPage = prev + 1;
        fetchMovies(tab, { page: newPage });
        return newPage;
      });
    } else if (tab === 'oscarWinners') {
      setOscarPage(prev => {
        const newPage = prev + 1;
        fetchMovies(tab, { page: newPage });
        return newPage;
      });
    }
  }, [activeTab, fetchMovies]);

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

  // Effects - only fetch when activeTab changes
  useEffect(() => {
    // Initial fetch when component mounts or activeTab changes
    if (activeTab === 'forYou') {
      fetchMovies(activeTab, { page: getRandomPage() });
    } else {
      fetchMovies(activeTab, { page: 1 });
    }
  }, [activeTab]); // Only re-run when activeTab changes

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
                  onRate={(movieId, rating) => {
                    // Handle the rating and get a callback when done
                    handleRateMovie(movieId, rating, movie);
                  }}
                  onStatusChange={async (movieId, status) => {
                    // For status changes (Not Interested, Watchlist), we'll treat them like ratings
                    // with special values: -1 for Not Interested, -2 for Watchlist
                    const ratingValue = status === 'not_interested' ? -1 : -2;
                    await handleRateMovie(movieId, ratingValue, movie);
                  }}
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
