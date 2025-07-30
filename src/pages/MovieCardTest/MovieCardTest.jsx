import { useState } from 'react';
import { Container, Typography, Grid } from '@mui/material';
import MovieCard from '../../components/MovieCard/MovieCard';

const MovieCardTest = () => {
  // Sample movie data for testing
  const [movies] = useState([
    {
      id: 1,
      title: 'The Shawshank Redemption',
      overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      vote_average: 8.7,
      release_date: '1994-09-23',
    },
    {
      id: 2,
      title: 'The Godfather',
      overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      vote_average: 8.7,
      release_date: '1972-03-24',
    },
    {
      id: 3,
      title: 'The Dark Knight',
      overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      vote_average: 8.5,
      release_date: '2008-07-16',
    },
  ]);

  const handleLike = (movieId) => {
    console.log(`Liked movie ${movieId}`);
  };

  const handleDislike = (movieId) => {
    console.log(`Disliked movie ${movieId}`);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" component="h1" className="mb-8 text-center">
        Movie Card Test Page
      </Typography>
      
      <Grid container spacing={4}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} key={movie.id}>
            <MovieCard 
              movie={movie}
              isLiked={false}
              isDisliked={false}
              onLike={() => handleLike(movie.id)}
              onDislike={() => handleDislike(movie.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MovieCardTest;
