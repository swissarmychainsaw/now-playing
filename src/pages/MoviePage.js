import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardMedia,
  CardContent,
  CircularProgress
} from '@mui/material';
import LikeDislikeButtons from '../components/LikeDislikeButtons';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const MoviePage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const tmdbRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}`,
          {
            params: {
              api_key: process.env.REACT_APP_TMDB_API_KEY,
              append_to_response: 'credits'
            }
          }
        );

        const omdbRes = await axios.get('https://www.omdbapi.com/', {
          params: {
            apikey: process.env.REACT_APP_OMDB_API_KEY,
            t: tmdbRes.data.title
          }
        });

        setMovie({
          ...tmdbRes.data,
          ratings: {
            critics: omdbRes.data.Ratings?.find(
              (r) => r.Source === 'Rotten Tomatoes'
            )?.Value,
            audience: omdbRes.data.imdbRating
          }
        });
      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading || !movie) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const trailerUrl = `https://www.youtube.com/results?search_query=${movie.title}+trailer`;

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Title + Year */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" gutterBottom>
                {movie.title} ({new Date(movie.release_date).getFullYear()})
              </Typography>
            </Box>

            {/* Overview */}
            <Typography variant="body1" sx={{ mb: 2 }}>
              {movie.overview}
            </Typography>

            {/* Trailer + Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Trailer
              </Button>
              <LikeDislikeButtons movieId={movie.id} user={user} />
            </Box>

            {/* Preferences / Ratings */}
            <Box sx={{ mt: 'auto', pt: 3 }}>
              <Typography variant="caption" color="textSecondary">
                Critics Score: {movie.ratings.critics || 'N/A'} | Audience Score: {movie.ratings.audience || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MoviePage;

