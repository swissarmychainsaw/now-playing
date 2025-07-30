import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Now Playing
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/movies" className="text-gray-700 hover:text-primary transition-colors">
            Movies
          </Link>
          <Link to="/my-ratings" className="text-gray-700 hover:text-primary transition-colors">
            My Ratings
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50 rounded-full transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-full transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
