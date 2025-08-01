import { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import SearchBar from '../../components/SearchBar/SearchBar';
import { FaPlay, FaStar } from 'react-icons/fa';

const Home: FC = () => {
  const navigate = useNavigate();

  // Handle search submission
  const handleSearch = useCallback((query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <Box
      component="div"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <Box 
        component="header" 
        sx={{ 
          py: 3,
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography 
          variant="h5" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}
        >
          Now Playing
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => navigate('/search')}
          sx={{ 
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Browse Movies
        </Button>
      </Box>

      {/* Hero Section */}
      <Container
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: { xs: 6, md: 12 },
          px: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background elements */}
        <Box 
          component={motion.div}
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0) 70%)',
            zIndex: 0,
            opacity: 0.7,
          }}
        />
        
        <Box 
          component={motion.div}
          animate={{
            y: [15, 0, 15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '8%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)',
            zIndex: 0,
            opacity: 0.7,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <motion.div variants={itemVariants}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                lineHeight: 1.1,
                background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              Discover & Rate
              <Box component="br" sx={{ display: { xs: 'none', sm: 'block' } }} />
              Your Next Favorite Movie
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              component="p"
              sx={{
                color: 'rgba(226, 232, 240, 0.9)',
                mb: 6,
                maxWidth: '700px',
                mx: 'auto',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.6,
              }}
            >
              The more you rate, the better our recommendations get. 
              Build your personalized watchlist and never miss a great movie again.
            </Typography>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            variants={itemVariants}
            style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
          >
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search for movies, directors, or genres..."
              className="home-search"
            />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            style={{ marginTop: '2rem' }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              gap: 2,
              mt: 4
            }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<FaPlay />}
                onClick={() => navigate('/browse')}
                sx={{
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                  }
                }}
              >
                Browse Popular
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<FaStar />}
                onClick={() => navigate('/top-rated')}
                sx={{
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  }
                }}
              >
                Top Rated
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
