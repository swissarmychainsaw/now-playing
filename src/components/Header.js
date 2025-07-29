import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  IconButton,
  Menu,
  styled
} from '@mui/material';
import { ExitToApp as SignOutIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import NowPlayingLogo from '../assets/images/nowplaying.png';

// Custom styled components for the header
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0f4c75 0%, #1b262c 100%)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  padding: theme.spacing(1, 0)
}));

const LogoText = styled(Typography)({
  fontFamily: '"Dancing Script", cursive',
  fontWeight: 700,
  fontSize: '2.5rem',
  background: 'linear-gradient(45deg, #ffffff, #f8f9fa)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
});

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: '20px',
  padding: '6px 20px',
  marginLeft: theme.spacing(1),
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.5)'
  }
}));

const Header = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar sx={{ 
        maxWidth: '100%',
        width: '100%',
        mx: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        py: 1
      }}>
        {/* Logo */}
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            height: 50 // Adjust based on your image's aspect ratio
          }}
        >
          <img 
            src={NowPlayingLogo} 
            alt="Now Playing" 
            style={{ 
              height: '100%', 
              width: 'auto',
              maxWidth: '200px' // Adjust based on your image's dimensions
            }} 
          />
        </Box>

        {/* User Controls - Only show when user is logged in */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* My Ratings Button */}
            <ActionButton 
              component={RouterLink}
              to="/ratings"
              startIcon={<span style={{ fontSize: '1.1rem' }}>★</span>}
            >
              My Ratings
            </ActionButton>
              
              {/* User Avatar */}
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ 
                  p: 0,
                  ml: 1,
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
                aria-controls="user-menu"
                aria-haspopup="true"
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: '#4a6fa5',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    border: '2px solid rgba(255, 255, 255, 0.7)'
                  }}
                  src={user.photoURL}
                >
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              
              {/* User Menu */}
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.contrastText">
                    {user.displayName || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', color: 'primary.contrastText' }}>
                    {user.email}
                  </Typography>
                </Box>
                
                <ActionButton 
                  fullWidth 
                  onClick={handleSignOut}
                  sx={{
                    borderRadius: 0,
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    m: 0,
                    border: 'none',
                    color: 'primary.main',
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                  startIcon={<SignOutIcon fontSize="small" />}
                >
                  Sign Out
                </ActionButton>
              </Menu>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
