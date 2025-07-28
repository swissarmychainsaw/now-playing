import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import MovieCard from '../components/MovieCard';

const MovieCardTest = () => {
  const testMovie = {
    id: 11,
    title: 'Star Wars: Episode IV - A New Hope',
    poster_path: '/6FfCtAuVAW8XJjZ7eWeLibRLWT.jpg',
    vote_average: 8.2,
    release_date: '1977-05-25',
    overview: 'Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.',
    genre_ids: [12, 28, 878]
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MovieCard Component Test
      </Typography>
      <Typography variant="body1" paragraph>
        This page is used to test and demonstrate the MovieCard component in isolation.
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        mt: 4,
        p: 2,
        border: '1px dashed #ccc',
        borderRadius: 1
      }}>
        <MovieCard 
          movie={testMovie}
          isLiked={false}
          isDisliked={false}
          showActions={true}
          showOverview={true}
        />
      </Box>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Test Movie Data:
        </Typography>
        <pre style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: '0.875rem',
          margin: 0
        }}>
          {JSON.stringify(testMovie, null, 2)}
        </pre>
      </Box>
    </Container>
  );
};

export default MovieCardTest;
