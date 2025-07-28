import React from 'react';
import { Typography, Box } from '@mui/material';

const RatingDisplay = ({ movie }) => (
  <Box>
    <Typography variant="caption" color="textSecondary">
      Critics Score: {movie.ratings?.critics || 'N/A'} | 
      Audience Score: {movie.ratings?.audience || 'N/A'}
    </Typography>
  </Box>
);

export default RatingDisplay;
