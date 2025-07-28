import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import {
  Box,
  Typography,
  Container,
  styled,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Rating,
  Paper,
  IconButton
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';
import LikeDislikeButtons from '../components/LikeDislikeButtons';
import axios from 'axios';

const GradientText = styled(Typography)`
  background: linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Pacifico', cursive;
  font-size: 3rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const MoviePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { likes, dislikes, updateLikes, updateDislikes } = useUser();
  const [trailer, setTrailer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const fetchMovieData = async () => {
    try {
      // Fetch movie details from TMDB
      const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        params: {
          api_key: process.env.REACT_APP_TMDB_API_KEY,
          append_to_response: 'credits,videos'
        }
      });

      // Fetch YouTube trailer ID
      const trailer = movieResponse.data.videos?.results?.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      setTrailer(trailer);

      // Fetch Rotten Tomatoes score from OMDb
      const omdbResponse = await axios.get('https://www.omdbapi.com/', {
        params: {
          apikey: process.env.REACT_APP_OMDB_API_KEY,
          t: movieResponse.data.title
        }
      });

      // Generate recommendations
      const recommendations = await generateRecommendations(movieResponse.data);

      setMovie({
        ...movieResponse.data,
        ratings: {
          critics: omdbResponse.data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value,
          audience: omdbResponse.data.imdbRating
        }
      });
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  const generateRecommendations = async (movie) => {
    try {
      // Get similar movies by director

//      const directorResponse = await axios.get(`https://api.themoviedb.org/3/person/${movie.credits.crew.find(c => c.job === 'Director').id}/movie_credits`, {
const director = movie.credits?.crew?.find(c => c.job === 'Director');
if (!director) {
  console.warn("No director found in movie credits.");
  return [];
}

const directorResponse = await axios.get(`https://api.themoviedb.org/3/person/${director.id}/movie_credits`, {

        params: { api_key: process.env.REACT_APP_TMDB_API_KEY }
      });
if (!director) {
  console.warn("No director found in movie credits. Using an extra genre recommendation.");
  recommendations.push(genreResponse.data.results[1]);
}


      // Get similar movies by top actors
      const actors = movie.credits.cast.slice(0, 3);
      const actorResponses = await Promise.all(
        actors.map(actor => 
          axios.get(`https://api.themoviedb.org/3/person/${actor.id}/movie_credits`, {
            params: { api_key: process.env.REACT_APP_TMDB_API_KEY }
          })
        )
      );

      // Get similar movies by genre
      const genreResponse = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
        params: {
          api_key: process.env.REACT_APP_TMDB_API_KEY,
          //with_genres: movie.genre_ids[0],
	  with_genres: movie.genres?.[0]?.id,
          page: 1
        }
      });

      // Combine and format recommendations
      const recommendations = [
        ...directorResponse.data.cast.slice(0, 1),
        ...actorResponses.flatMap(resp => resp.data.cast.slice(0, 3)),
        genreResponse.data.results[0]
      ];

if (!movie && !loading) {
  return <div>Error loading movie details. Try a different one.</div>;
}

      // Remove duplicates and the current movie
      return recommendations.filter((movie, index, self) => 
        index === self.findIndex(t => t.id === movie.id) && movie.id !== parseInt(id)
      ).slice(0, 5);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  };

  const handleRecommendationClick = (movieId) => {
    window.location.href = `/movie/${movieId}`;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardMedia
                component="img"
                height="500"
                image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                sx={{
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                      {movie.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {new Date(movie.release_date).getFullYear()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  {movie.overview}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Tooltip title="Watch Trailer">
                    <IconButton 
                      component="a" 
                      href={
                        trailer ? 
                          `https://www.youtube.com/watch?v=${trailer.key}` : 
                          `https://www.youtube.com/results?search_query=${movie.title}+trailer`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                      disabled={!trailer}
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
        </Grid>
      </Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          You Might Also Like
        </Typography>
        <Grid container spacing={2}>
          {recommendations.map((movie) => (
            <Grid item xs={12} sm={6} md={4} key={movie.id}>
              <Card
                onClick={() => handleRecommendationClick(movie.id)}
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
                  image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
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
                    <Tooltip title="Watch Trailer">
                      <IconButton 
                        component="a" 
                        href={
                          trailer ? 
                            `https://www.youtube.com/watch?v=${trailer.key}` : 
                            `https://www.youtube.com/results?search_query=${movie.title}+trailer`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        disabled={!trailer}
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
    </Box>
  );
};

export default MoviePage;
