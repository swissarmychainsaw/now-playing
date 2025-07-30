import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBox from '../../components/SearchBox/SearchBox';
import RecommendationTabs from '../../components/RecommendationTabs/RecommendationTabs';
import MovieCard from '../../components/MovieCard/MovieCard';
import { FaStar } from 'react-icons/fa';

// Sample movie data for the login page (matches the landing page)
const sampleMovies = [
  {
    id: 1,
    title: 'Inception',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    is_oscar_winner: true
  },
  {
    id: 2,
    title: 'The Shawshank Redemption',
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    release_date: '1994-09-23',
    vote_average: 8.7,
    is_oscar_winner: false
  },
  {
    id: 3,
    title: 'The Godfather',
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    release_date: '1972-03-14',
    vote_average: 8.7,
    is_oscar_winner: true
  },
  {
    id: 4,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    is_oscar_winner: false
  },
  {
    id: 5,
    title: 'Pulp Fiction',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    release_date: '1994-09-10',
    vote_average: 8.5,
    is_oscar_winner: true
  }
];

const LoginPage = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Handle full page click for login
  const handlePageClick = async (e) => {
    // Prevent triggering if clicking on interactive elements
    if (e.target.closest('button, a, [role="button"], [role="link"]')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col"
      onClick={handlePageClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Now Playing</h1>
            <div className="flex space-x-4">
              <button 
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePageClick(e);
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In with Google'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Matches the landing page */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBox 
              value="" 
              onChange={() => {}} 
              onSearch={() => {}} 
              disabled={true}
              placeholder="Sign in to search for movies..."
            />
          </div>

          {/* Recommendation Tabs */}
          <div className="mb-6">
            <RecommendationTabs 
              activeTab="forYou"
              onTabChange={() => {}}
              isLoading={false}
              tabConfig={[
                { id: 'forYou', label: 'For You' },
                { id: 'oscarWinners', label: 'Oscar Winners' },
                { id: 'popular', label: 'Popular' },
                { id: 'criticsPicks', label: "Critics' Picks" },
              ]}
            />
          </div>

          {/* Movie Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sampleMovies.map((movie) => (
              <div 
                key={movie.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative pb-2/3">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  {movie.is_oscar_winner && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
                      🏆 Oscar Winner
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm text-gray-600">
                        {new Date(movie.release_date).getFullYear()}
                        {movie.is_oscar_winner && (
                          <span className="ml-1 text-amber-600" title="Oscar Winner">🏆</span>
                        )}
                      </p>
                      <div className="flex items-center text-amber-500">
                        <FaStar className="w-3.5 h-3.5 mr-0.5" />
                        <span className="text-xs font-medium text-gray-700">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overlay with sign in message */}
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In to Continue</h2>
              <p className="text-gray-600 mb-6">Click anywhere on the page to sign in with Google and access your personalized movie recommendations.</p>
              <button
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePageClick(e);
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.464 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.464 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.464 48.949 L -21.464 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.464 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.454 45.859 L -21.454 48.949 C -20.524 46.099 -17.884 43.989 -14.754 43.989 Z" />
                      </g>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
