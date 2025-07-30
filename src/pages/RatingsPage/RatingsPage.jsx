import { useState } from 'react';
import { FaStar, FaRegStar, FaHeart, FaRegHeart } from 'react-icons/fa';

const RatingsPage = () => {
  const [activeTab, setActiveTab] = useState('Likes');
  
  // Mock data - replace with actual data from your state management
  const mockLiked = [
    { id: 1, title: 'Dune', releaseYear: 2021, rating: 8.0, posterUrl: '/placeholder-movie.png' },
    { id: 2, title: 'The Batman', releaseYear: 2022, rating: 7.9, posterUrl: '/placeholder-movie.png' },
  ];
  
  const mockDisliked = [
    { id: 3, title: 'Movie C', releaseYear: 2023, rating: 5.2, posterUrl: '/placeholder-movie.png' },
  ];

  const renderMovies = (movies) => {
    if (movies.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {activeTab === 'Likes' 
              ? "You haven't liked any movies yet."
              : "You haven't disliked any movies yet."}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Rate movies to see them here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="group relative">
            <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div>
                  <h3 className="text-white font-semibold">{movie.title}</h3>
                  <div className="flex items-center text-yellow-400 mt-1">
                    <FaStar className="mr-1" />
                    <span className="text-sm">{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <button className="p-2 bg-black/70 rounded-full text-white hover:bg-primary transition-colors">
                  {activeTab === 'Likes' ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="font-medium text-gray-900 line-clamp-1">{movie.title}</h3>
              <p className="text-sm text-gray-500">{movie.releaseYear}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Ratings</h1>
      </div>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-colors ${
            activeTab === 'Likes'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('Likes')}
        >
          <FaHeart className={activeTab === 'Likes' ? 'text-red-300' : 'text-red-400'} />
          <span>Liked Movies</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {mockLiked.length}
          </span>
        </button>
        
        <button
          className={`px-6 py-2 rounded-full flex items-center space-x-2 transition-colors ${
            activeTab === 'Dislikes'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('Dislikes')}
        >
          <FaRegHeart className={activeTab === 'Dislikes' ? 'text-red-300' : 'text-gray-400'} />
          <span>Disliked Movies</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {mockDisliked.length}
          </span>
        </button>
      </div>

      {activeTab === 'Likes' ? renderMovies(mockLiked) : renderMovies(mockDisliked)}
    </div>
  );
};

export default RatingsPage;
