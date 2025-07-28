import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import MovieDetails from '../components/MovieDetails';
import RatingDisplay from '../components/RatingDisplay';
import TrailerAndActions from '../components/TrailerAndActions';
import LikeDislikeButtons from '../components/LikeDislikeButtons';
import axios from 'axios';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';

const MoviePage = () => {
  // SVG placeholder for missing posters
  const placeholderPoster = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E
    %3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E
    %3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23999' text-anchor='middle' dy='.3em'%3E
      Movie Poster
    %3C/text%3E
  %3C/svg%3E`;
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trailer, setTrailer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const { likes, dislikes, updateLikes, updateDislikes } = useUser();

  const fetchMovieData = async () => {
    try {
      const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        params: {
          api_key: process.env.REACT_APP_TMDB_API_KEY,
          append_to_response: 'credits,videos'
        }
      });

      const trailer = movieResponse.data.videos?.results?.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      setTrailer(trailer);

      const omdbResponse = await axios.get('https://www.omdbapi.com/', {
        params: {
          apikey: process.env.REACT_APP_OMDB_API_KEY,
          t: movieResponse.data.title
        }
      });

      const recommendations = await generateRecommendations(movieResponse.data);

      setMovie({
        ...movieResponse.data,
        ratings: {
          critics: omdbResponse.data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value,
          audience: omdbResponse.data.imdbRating
        },
        poster_path: movieResponse.data.poster_path || '/placeholder-poster.png'
      });
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching movie data:', error);
      setError('Failed to load movie details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (movie) => {
    try {
      const director = movie.credits?.crew?.find(c => c.job === 'Director');
      if (!director) {
        console.warn("No director found in movie credits.");
        return [];
      }

      const directorResponse = await axios.get(`https://api.themoviedb.org/3/person/${director.id}/movie_credits`, {
        params: { api_key: process.env.REACT_APP_TMDB_API_KEY }
      });

      const actors = movie.credits.cast.slice(0, 3);
      const actorResponses = await Promise.all(
        actors.map(actor => 
          axios.get(`https://api.themoviedb.org/3/person/${actor.id}/movie_credits`, {
            params: { api_key: process.env.REACT_APP_TMDB_API_KEY }
          })
        )
      );

      const genreResponse = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
        params: {
          api_key: process.env.REACT_APP_TMDB_API_KEY,
          with_genres: movie.genres?.[0]?.id,
          page: 1
        }
      });

      const recommendations = [
        ...directorResponse.data.cast.slice(0, 1),
        ...actorResponses.flatMap(resp => resp.data.cast.slice(0, 3)),
        genreResponse.data.results[0]
      ];

      return recommendations.filter((movie, index, self) => 
        index === self.findIndex(t => t.id === movie.id) && movie.id !== parseInt(id)
      ).slice(0, 5);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  };

  const handleLike = async () => {
    try {
      if (movie) {
        await updateLikes(movie.id);
      }
    } catch (err) {
      console.error('Error liking movie:', err);
    }
  };

  const handleDislike = async () => {
    try {
      if (movie) {
        await updateDislikes(movie.id);
      }
    } catch (err) {
      console.error('Error disliking movie:', err);
    }
  };

  const isMovieLiked = () => likes?.includes(movie?.id) || false;

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!movie) {
    return <div>Error loading movie details. Try a different one.</div>;
  }

  const trailerUrl = `https://www.youtube.com/results?search_query=${movie.title}+trailer`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ 
        mt: 4, 
        mb: 4, 
        border: '1px solid #ccc', 
        borderRadius: 1, 
        display: 'flex',
        alignItems: 'flex-start'
      }}>
        <Grid container spacing={2}>
          {/* Left column: Poster */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                maxWidth: 300,
                width: '100%',
                boxShadow: 3
              }}
            >
              <CardMedia
                component="img"
                image={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : placeholderPoster}
                alt={movie.title}
                onError={(e) => {
                  const img = e.target;
                  img.src = '/placeholder-poster.png';
                }}
              />
            </Card>
          </Grid>
          {/* Right column: Details */}
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, width: '100%' }}>
              <MovieDetails movie={movie} />
              <TrailerAndActions 
                movie={movie} 
                trailer={trailer}
                onLike={handleLike}
                onDislike={handleDislike}
                isLiked={isMovieLiked()}
              />
              <RatingDisplay movie={movie} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Recommendations Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          You Might Also Like
        </Typography>
        <Grid container spacing={2}>
          {recommendations.map((movie) => (
            <Grid item xs={12} sm={6} md={4} key={movie.id}>
              <Card
                onClick={() => navigate(`/movie/${movie.id}`)}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : placeholderPoster}
                  alt={movie.title}
                  onError={(e) => {
                    const img = e.target;
                    img.src = '/placeholder-poster.png';
                  }}
                  sx={{
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {movie.title}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {new Date(movie.release_date).getFullYear()}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <Tooltip title="Watch trailer">
                      <IconButton 
                        component="a" 
                        href={`https://www.youtube.com/results?search_query=${movie.title}+trailer`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        disabled={!trailer}
                        aria-label="Watch trailer"
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
                    <LikeDislikeButtons
                      movieId={movie.id}
                      isLiked={isMovieLiked()}
                      onLike={handleLike}
                      onDislike={handleDislike}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Box>
  );
};

export default MoviePage;
