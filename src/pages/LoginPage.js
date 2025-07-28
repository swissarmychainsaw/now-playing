import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

const LoginPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Get user info
      const user = result.user;
      console.log('User signed in:', user.email);
      
      navigate('/');
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message || 'An error occurred during sign-in');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to <i>Now Playing!</i>
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSignIn}
          sx={{
            backgroundColor: '#4285F4',
            color: 'white',
            '&:hover': {
              backgroundColor: '#357ABE'
            }
          }}
        >
          Sign in with Google
        </Button>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Your Google account will be used to track your movie preferences.
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
