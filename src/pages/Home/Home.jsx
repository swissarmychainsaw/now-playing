import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import SearchBox from '../../components/SearchBox/SearchBox';
import RecommendationTabs from '../../components/RecommendationTabs/RecommendationTabs';
import MovieCard from '../../components/MovieCard/MovieCard';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sample movie data
  const sampleMovies = [
    {
      id: 1,
      title: 'The Shawshank Redemption',
      release_date: '1994-09-23',
      vote_average: 9.3,
      poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
    },
    {
      id: 2,
      title: 'The Godfather',
      release_date: '1972-03-24',
      vote_average: 8.7,
      poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
    },
    {
      id: 3,
      title: 'The Dark Knight',
      release_date: '2008-07-16',
      vote_average: 8.5,
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchMovies = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setMovies(sampleMovies);
      setLoading(false);
    };

    fetchMovies();
  }, []);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.overview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categories from BRD
  const categories = [
    { id: 'now_playing', name: 'Now Playing' },
    { id: 'popular', name: 'Popular' },
    { id: 'top_rated', name: 'Top Rated' },
    { id: 'upcoming', name: 'Upcoming' },
  ];

  const [activeCategory, setActiveCategory] = useState('now_playing');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover Amazing Movies
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find your next favorite movie. Search by title, genre, or actor.
          </p>
          
          <div className="max-w-2xl mx-auto mb-12">
            <SearchBox 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search for movies..."
            />
          </div>
        </section>

        {/* Category Tabs */}
        <section className="mb-8">
          <RecommendationTabs 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </section>

        {/* Movie Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => navigate(`/movie/${movie.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
