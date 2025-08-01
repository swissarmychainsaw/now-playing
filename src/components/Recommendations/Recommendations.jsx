import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import SearchMovieCard from '../SearchMovieCard/SearchMovieCard';

const Recommendations = ({ movieId, onMovieSelect }) => {
  const [recommendations, setRecommendations] = useState({
    byDirector: { data: [], loading: false, error: null },
    byCast: { data: [], loading: false, error: null },
    byGenre: { data: [], loading: false, error: null },
  });
  const [movieDetails, setMovieDetails] = useState(null);

  // Fetch movie details including credits and similar movies
  useEffect(() => {
    if (!movieId) return;

    const fetchMovieDetails = async () => {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,similar`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch movie details: ${response.status}`);
        }

        const data = await response.json();
        setMovieDetails(data);
        
        // Fetch recommendations based on different criteria
        fetchRecommendations(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  // Fetch recommendations based on different criteria
  const fetchRecommendations = async (movieData) => {
    if (!movieData) return;

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const director = movieData.credits?.crew?.find(
      (member) => member.job === 'Director'
    );
    const topCast = movieData.credits?.cast?.slice(0, 3) || [];
    const genreId = movieData.genres?.[0]?.id;

    // Fetch movies by same director
    if (director) {
      setRecommendations((prev) => ({
        ...prev,
        byDirector: { ...prev.byDirector, loading: true, error: null },
      }));

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_crew=${director.id}&sort_by=vote_average.desc&vote_count.gte=100&page=1`
        );

        if (response.ok) {
          const data = await response.json();
          setRecommendations((prev) => ({
            ...prev,
            byDirector: {
              data: data.results
                .filter((m) => m.id !== movieId)
                .slice(0, 5),
              loading: false,
              error: null,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching director movies:', error);
        setRecommendations((prev) => ({
          ...prev,
          byDirector: {
            ...prev.byDirector,
            loading: false,
            error: 'Failed to load director movies',
          },
        }));
      }
    }

    // Fetch movies by top cast members
    if (topCast.length > 0) {
      setRecommendations((prev) => ({
        ...prev,
        byCast: { ...prev.byCast, loading: true, error: null },
      }));

      try {
        const castPromises = topCast.map((actor) =>
          fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_cast=${actor.id}&sort_by=vote_average.desc&vote_count.gte=100&page=1`
          ).then((res) => res.json())
        );

        const castResults = await Promise.all(castPromises);
        const castMovies = castResults
          .flatMap((result) => result.results || [])
          .filter((m) => m.id !== movieId)
          .slice(0, 5);

        setRecommendations((prev) => ({
          ...prev,
          byCast: {
            data: castMovies,
            loading: false,
            error: null,
          },
        }));
      } catch (error) {
        console.error('Error fetching cast movies:', error);
        setRecommendations((prev) => ({
          ...prev,
          byCast: {
            ...prev.byCast,
            loading: false,
            error: 'Failed to load cast movies',
          },
        }));
      }
    }

    // Fetch movies by same genre
    if (genreId) {
      setRecommendations((prev) => ({
        ...prev,
        byGenre: { ...prev.byGenre, loading: true, error: null },
      }));

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100&page=1`
        );

        if (response.ok) {
          const data = await response.json();
          setRecommendations((prev) => ({
            ...prev,
            byGenre: {
              data: data.results
                .filter((m) => m.id !== movieId)
                .slice(0, 5),
              loading: false,
              error: null,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching genre movies:', error);
        setRecommendations((prev) => ({
          ...prev,
          byGenre: {
            ...prev.byGenre,
            loading: false,
            error: 'Failed to load similar movies',
          },
        }));
      }
    }
  };

  // Render a single recommendation section
  const renderRecommendationSection = (title, data, loading, error, reason) => {
    if (loading) {
      return (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-2xl text-blue-500" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center text-yellow-400 mb-2">
              <FaExclamationTriangle className="mr-2" />
              {error}
            </div>
            <button
              onClick={() => movieDetails && fetchRecommendations(movieDetails)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return null;
    }

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <div className="flex items-center text-sm text-gray-400">
            <FaInfoCircle className="mr-1" />
            <span>Based on {reason}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((movie) => (
            <SearchMovieCard
              key={movie.id}
              movie={movie}
              onClick={onMovieSelect}
              reason={reason}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
      
      {renderRecommendationSection(
        "From the Same Director",
        recommendations.byDirector.data,
        recommendations.byDirector.loading,
        recommendations.byDirector.error,
        `director: ${movieDetails?.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A'}`
      )}
      
      {renderRecommendationSection(
        "Featuring the Same Cast",
        recommendations.byCast.data,
        recommendations.byCast.loading,
        recommendations.byCast.error,
        `actors: ${movieDetails?.credits?.cast?.slice(0, 2).map(a => a.name).join(', ') || 'N/A'}`
      )}
      
      {renderRecommendationSection(
        "Similar Movies",
        recommendations.byGenre.data,
        recommendations.byGenre.loading,
        recommendations.byGenre.error,
        `genre: ${movieDetails?.genres?.[0]?.name || 'N/A'}`
      )}
    </div>
  );
};

export default Recommendations;
