import React from 'react';
import { Typography, Box } from '@mui/material';

const MovieDetails = ({ movie }) => {
  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const topCast = movie.credits?.cast?.slice(0, 3);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {movie.title}
        {movie.release_date && !isNaN(new Date(movie.release_date)) && ` (${new Date(movie.release_date).getFullYear()})`}
      </Typography>

      {/* Director */}
      {movie.credits?.crew?.find(c => c.job === 'Director') && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Directed by: {movie.credits.crew.find(c => c.job === 'Director').name}
        </Typography>
      )}

      {/* Cast */}
      {movie.credits?.cast?.slice(0, 3).length > 0 && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
          Starring: {movie.credits.cast.slice(0, 3).map((actor, index) => 
            `${actor.name}${index < 2 ? ', ' : ''}`
          )}
        </Typography>
      )}

      {/* Overview */}
      <Typography variant="body1" sx={{ mb: 3 }}>
        {movie.overview || "No overview available."}
      </Typography>
    </Box>
  );
};

export default MovieDetails;
