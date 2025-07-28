import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, styled, Container } from '@mui/material';
import theme from './theme';
import { UserProvider } from './context/UserContext';
import { auth } from './config/firebase';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import MoviePage from './pages/MoviePage';
import LoginPage from './pages/LoginPage';
import LikedMovies from './pages/LikedMovies';

const GradientText = styled('div')`
  background: linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Pacifico', cursive;
  font-size: 3rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

function App() {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/movie/:id" element={<ProtectedRoute><MoviePage /></ProtectedRoute>} />
              <Route path="/liked" element={<ProtectedRoute><LikedMovies /></ProtectedRoute>} />
            </Routes>
          </Container>
        </Box>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
