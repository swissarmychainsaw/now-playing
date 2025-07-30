import { useUser } from '../../context/UserContext';
import { FaGoogle, FaSignOutAlt } from 'react-icons/fa';

export const AuthButton = () => {
  const { user, signInWithGoogle, signOut } = useUser();

  if (user) {
    return (
      <button
        onClick={signOut}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaSignOutAlt className="text-gray-600" />
        <span>Sign Out</span>
        {user.photoURL && (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'}
            className="w-6 h-6 rounded-full"
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <FaGoogle className="text-white" />
      <span>Sign in with Google</span>
    </button>
  );
};

export default AuthButton;
