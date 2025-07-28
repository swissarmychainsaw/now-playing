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
  const [streamingProviders, setStreamingProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trailer, setTrailer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const { likes, dislikes, updateLikes, updateDislikes } = useUser();

  const getStreamingInfo = (providers) => {
    if (!movie || !providers) return null;
    
    // Check for US streaming providers first
    const usProviders = providers.US;
    if (!usProviders) return null;

    // Priority: flatrate (subscription) > rent > buy
    if (usProviders.flatrate?.length > 0) {
      return {
        url: `https://www.themoviedb.org/movie/${movie.id}/watch?locale=US`,
        provider: usProviders.flatrate[0].provider_name,
        type: 'Stream on',
        logo: usProviders.flatrate[0].logo_path 
          ? `https://image.tmdb.org/t/p/original${usProviders.flatrate[0].logo_path}`
          : null
      };
    }
    if (usProviders.rent?.length > 0) {
      return {
        url: `https://www.themoviedb.org/movie/${movie.id}/watch?locale=US`,
        provider: usProviders.rent[0].provider_name,
        type: 'Rent on',
        logo: usProviders.rent[0].logo_path
          ? `https://image.tmdb.org/t/p/original${usProviders.rent[0].logo_path}`
          : null
      };
    }
    if (usProviders.buy?.length > 0) {
      return {
        url: `https://www.themoviedb.org/movie/${movie.id}/watch?locale=US`,
        provider: usProviders.buy[0].provider_name,
        type: 'Buy on',
        logo: usProviders.buy[0].logo_path
          ? `https://image.tmdb.org/t/p/original${usProviders.buy[0].logo_path}`
          : null
      };
    }
    
    return null;
  };
  
  // Get streaming info whenever movie or providers change
  const streamingInfo = movie && streamingProviders ? getStreamingInfo(streamingProviders) : null;

  const fetchMovieData = async () => {
    try {
      // Fetch movie details, credits, and watch providers in parallel
      const [movieResponse, providersResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
          params: {
            api_key: process.env.REACT_APP_TMDB_API_KEY,
            append_to_response: 'credits'
          }
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, {
          params: {
            api_key: process.env.REACT_APP_TMDB_API_KEY
          }
        })
      ]);

      // Get ratings from TMDb
      const ratings = {
        critics: movieResponse.data.vote_average * 10, // Convert to percentage
        audience: movieResponse.data.popularity // Using popularity as a fallback
      };

      // Set streaming providers
      setStreamingProviders(providersResponse.data.results);

      // Generate recommendations
      const recommendations = await generateRecommendations(movieResponse.data);

      setMovie({
        ...movieResponse.data,
        ratings,
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

  const getTrailerUrl = async (movieTitle) => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
          q: `${movieTitle} official trailer`,
          type: 'video',
          maxResults: 1,
          videoCategoryId: 24 // Entertainment category
        }
      });
      
      if (response.data.items && response.data.items.length > 0) {
        const videoId = response.data.items[0].id.videoId;
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
      
      // If no trailer found, return a search URL
      return `https://www.youtube.com/results?search_query=${movieTitle}+official+trailer`;
    } catch (error) {
      console.error('Error fetching trailer:', error);
      return `https://www.youtube.com/results?search_query=${movieTitle}+official+trailer`;
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
  const isMovieDisliked = () => dislikes?.includes(movie?.id) || false;

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  useEffect(() => {
    if (movie?.title) {
      getTrailerUrl(movie.title).then(url => setTrailer(url));
    }
  }, [movie?.title]);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ mt: 4, mb: 4, border: '1px solid #ccc', borderRadius: 1 }}>
        <Grid
          container
          direction="row"
          spacing={4}
          wrap="nowrap"
          alignItems="flex-start"
        >
          {/* Left column: Poster */}
          <Grid item sx={{ flex: '0 0 300px' }}>
            <Card sx={{ width: '100%', boxShadow: 3 }}
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
          <Grid item sx={{ flex: 1 }}>
            <Box sx={{ 
              p: 2, 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%' 
            }}>
              <MovieDetails movie={movie} />
              <RatingDisplay movie={movie} />
              {movie && (
                <TrailerAndActions
                  movie={movie}
                  streamingInfo={streamingInfo}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  isLiked={isMovieLiked()}
                  isDisliked={isMovieDisliked()}
                />
              )}
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
