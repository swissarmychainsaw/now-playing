import React, { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion, Variants } from 'framer-motion';
import SearchBar from '../../components/SearchBar/SearchBar';
import { FaPlay, FaStar } from 'react-icons/fa';

const Home: FC = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);

  // Handle search submission
  const handleSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery && !isSearching) {
      setIsSearching(true);
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`, { replace: false });
      // Reset the searching state after navigation
      setTimeout(() => setIsSearching(false), 1000);
    }
  }, [navigate, isSearching]);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
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
        background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* Removed header bar */}

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
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 12 },
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

        <Box sx={{ position: 'relative', zIndex: 1, width: '100%', pt: { xs: 8, md: 12 } }}>
          <motion.div variants={itemVariants}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 6,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                lineHeight: 1.1,
                background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              Rate Movies. Get great Recommendations.
            </Typography>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            variants={itemVariants}
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
          >
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search for movies, directors, or genres..."
              className="home-search"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              component="p"
              sx={{
                color: 'rgba(226, 232, 240, 0.9)',
                mt: 6,
                mb: 2,
                maxWidth: '700px',
                mx: 'auto',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.6,
                textAlign: 'center'
              }}
            >
              The more you rate, the better the recommendations.
              <br />
              Build your personalized watchlist.
            </Typography>
          </motion.div>


        </Box>
      </Container>
    </Box>
  );
};

export default Home;
