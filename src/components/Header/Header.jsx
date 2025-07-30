import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaChevronDown, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-hot-toast';

const Header = () => {
  const { user, signOut } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-capri to-ryb-blue bg-clip-text text-transparent">
            Now Playing
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-capri transition-colors">
            Home
          </Link>
          <Link to="/movies" className="text-gray-700 hover:text-capri transition-colors">
            Movies
          </Link>
          {user && (
            <Link to="/my-ratings" className="text-gray-700 hover:text-capri transition-colors">
              My Ratings
            </Link>
          )}
        </nav>
        
        <div className="relative">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/my-ratings"
                className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                My Ratings
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FaUser className="text-indigo-600" />
                    </div>
                  )}
                  <FaChevronDown className={`text-gray-500 text-xs transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
