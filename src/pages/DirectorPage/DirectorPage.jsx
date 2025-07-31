import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDirectorDetails, getDirectorMovies } from '../../services/tmdb';
import MovieCard from '../../components/MovieCard/MovieCard';
import { useRatings } from '../../context/RatingsContext';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaRegHeart, FaFilm, FaArrowLeft, FaStar, FaRegStar, FaExternalLinkAlt } from 'react-icons/fa';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';

const DirectorPage = () => {
  const { directorId } = useParams();
  const [director, setDirector] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { ratings } = useRatings();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if user is following this director
  const checkIfFollowing = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const directorRef = doc(db, 'users', currentUser.uid, 'followedDirectors', directorId);
      const directorDoc = await getDoc(directorRef);
      setIsFollowing(directorDoc.exists());
    } catch (error) {
      console.error('Error checking if following director:', error);
    }
  }, [currentUser, directorId]);

  // Toggle follow status for director
  const toggleFollowDirector = async () => {
    if (!currentUser) {
      toast.error('Please sign in to follow directors');
      navigate('/login', { state: { from: `/director/${directorId}` } });
      return;
    }

    setIsFollowLoading(true);
    try {
      const directorRef = doc(db, 'users', currentUser.uid, 'followedDirectors', directorId);
      
      if (isFollowing) {
        await deleteDoc(directorRef);
        toast.success(`Unfollowed ${director?.name || 'director'}`);
        setIsFollowing(false);
      } else {
        await setDoc(directorRef, {
          id: directorId,
          name: director?.name || '',
          profilePath: director?.profile_path || '',
          timestamp: serverTimestamp()
        });
        toast.success(`Followed ${director?.name || 'director'}`);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Check follow status when director or user changes
  useEffect(() => {
    if (currentUser && director) {
      checkIfFollowing();
    } else {
      setIsFollowing(false);
    }
  }, [currentUser, director, checkIfFollowing]);

  useEffect(() => {
    const fetchDirectorData = async () => {
      try {
        setLoading(true);
        const [directorData, moviesData] = await Promise.all([
          getDirectorDetails(directorId),
          getDirectorMovies(directorId)
        ]);
        setDirector(directorData);
        setMovies(moviesData.cast || []);
      } catch (err) {
        console.error('Error fetching director data:', err);
        setError('Failed to load director information');
      } finally {
        setLoading(false);
      }
    };

    fetchDirectorData();
  }, [directorId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!director) return <div className="text-center py-10">Director not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="flex items-center space-x-4">
            {director.homepage && (
              <a
                href={director.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-blue-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                <FaExternalLinkAlt className="mr-2" />
                Website
              </a>
            )}
            <button
              onClick={toggleFollowDirector}
              disabled={isFollowLoading}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isFollowing 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${isFollowLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isFollowLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⟳</span>
                  {isFollowing ? 'Unfollowing...' : 'Following...'}
                </span>
              ) : (
                <>
                  {isFollowing ? (
                    <>
                      <FaHeart className="mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <FaRegHeart className="mr-2" />
                      Follow
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm border border-gray-700/50 mb-12">
          <div className="p-6 md:flex">
            {director.profile_path ? (
              <div className="relative group flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <img
                  src={`https://image.tmdb.org/t/p/w300${director.profile_path}`}
                  alt={director.name}
                  className="w-full md:w-56 h-80 object-cover rounded-xl shadow-lg transform transition-transform group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-4">
                  <span className="text-white text-sm font-medium">TMDB</span>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-56 h-80 bg-gradient-to-br from-blue-900/30 to-gray-800 rounded-xl flex flex-col items-center justify-center mb-6 md:mb-0 md:mr-8 p-6 text-center">
                <FaFilm className="text-gray-500 text-5xl mb-4" />
                <span className="text-gray-400 text-sm">No photo available</span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {director.name}
                </h1>
                {director.birthday && (
                  <div className="flex items-center text-gray-400 mt-2 md:mt-0">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>Director</span>
                    <span className="mx-2">•</span>
                    <span>Born: {new Date(director.birthday).toLocaleDateString()}</span>
                    {director.deathday && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Died: {new Date(director.deathday).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {director.also_known_as?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-gray-400">Also known as:</span>
                  {director.also_known_as.map((name, index) => (
                    <span key={index} className="bg-gray-700/50 text-gray-300 text-sm px-3 py-1 rounded-full">
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {director.place_of_birth && (
                <div className="mb-6">
                  <span className="text-gray-400">Place of Birth: </span>
                  <span className="text-gray-200">{director.place_of_birth}</span>
                </div>
              )}

              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
                  <FaFilm className="mr-2" />
                  Biography
                </h3>
                {director.biography ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed">
                      {director.biography}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No biography available.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <span className="w-8 h-0.5 bg-blue-500 mr-3"></span>
              Filmography
              <span className="ml-3 text-sm font-normal text-gray-400">
                ({movies.length} {movies.length === 1 ? 'movie' : 'movies'})
              </span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Filter:</span>
              <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All</option>
                <option>Feature Films</option>
                <option>As Director</option>
                <option>As Writer</option>
              </select>
              
              <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Highest Rated</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>
          
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => {
                const userRating = ratings[movie.id]?.rating || 0;
                return (
                  <MovieCard
                    key={movie.id}
                    movie={{
                      ...movie,
                      user_rating: userRating
                    }}
                    showRating={true}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400">No movies found for this director.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectorPage;
