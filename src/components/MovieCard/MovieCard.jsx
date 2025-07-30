import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <Card 
      onClick={handleClick}
      className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      <CardMedia
        component="img"
        height="300"
        image={movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : '/placeholder-movie.png' // Add a placeholder image in your public folder
        }
        alt={movie.title}
        className="object-cover h-64"
      />
      <CardContent className="flex-grow flex flex-col">
        <Box className="flex justify-between items-start mb-2">
          <Typography variant="h6" component="h2" className="font-bold line-clamp-2">
            {movie.title}
          </Typography>
          <Box className="flex items-center bg-yellow-100 px-2 py-1 rounded">
            <Star className="text-yellow-500 mr-1" fontSize="small" />
            <span className="text-sm font-medium">
              {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
            </span>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" className="mb-2">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          className="line-clamp-3 text-sm flex-grow"
        >
          {movie.overview || 'No overview available.'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
