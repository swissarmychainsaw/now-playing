import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import MovieCard from '../../../components/MovieCard';
import styles from './MovieGrid.module.css';

const MovieGrid = ({ movies, loading, error }) => {
  if (loading) {
    return (
      <Box className={styles.messageContainer}>
        <div className={styles.loadingSpinner}></div>
        <Typography variant="h6" className={styles.loadingText}>
          Loading movies...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={styles.messageContainer}>
        <Typography color="error" className={styles.errorText}>
          {error}
        </Typography>
      </Box>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <Box className={styles.messageContainer}>
        <Typography variant="h6" color="textSecondary">
          No movies found. Try a different search or category.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} className={styles.movieGrid}>
      {movies.map((movie) => (
        <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3} xl={2.4}>
          <MovieCard 
            movie={movie}
            className={styles.movieCard}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default MovieGrid;
