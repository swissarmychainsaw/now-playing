import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
        mb: 3
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h5" fontWeight="bold">
            Now Playing
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          {user ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                sx={{ width: 32, height: 32 }}
              />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleSignOut}
                sx={{ textTransform: 'none' }}
              >
                Sign Out
              </Button>
            </Box>
          ) : (
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="contained" 
              size="small"
              sx={{ textTransform: 'none' }}
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
