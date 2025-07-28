import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useUser } from '../context/UserContext';
import { auth } from '../config/firebase';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import GradientText from './GradientText';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{
      backgroundColor: '#1976d2',
      color: 'white'
    }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ mr: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalMoviesIcon sx={{ fontSize: '1.5rem', color: '#1976d2' }} />
              <GradientText>
                Now Playing!
              </GradientText>
            </Box>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {user ? (
            <>
              <Typography variant="body2" color="white">
                {user.email}
              </Typography>
              <Button 
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/liked"
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.9)'
                  }
                }}
              >
                My Ratings
              </Button>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => {
                  auth.signOut().then(() => {
                    navigate('/');
                  });
                }}
                sx={{
                  backgroundColor: 'white',
                  color: '#1976d2',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
