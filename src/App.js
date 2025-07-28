import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import theme from './theme';

// Components
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import MoviePage from './pages/MoviePage';
import LoginPage from './pages/LoginPage';
import LikedMovies from './pages/LikedMovies';
import MovieCardTest from './pages/MovieCardTest';

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unknown error occurred'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ flexGrow: 1 }}>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/movie/:id" element={
                  <ProtectedRoute>
                    <MoviePage />
                  </ProtectedRoute>
                } />
                <Route path="/movie/search/:query" element={
                  <MoviePage isSearchResult={true} />
                } />
                <Route path="/liked" element={
                  <ProtectedRoute>
                    <LikedMovies />
                  </ProtectedRoute>
                } />
                <Route path="/MovieCardTest" element={<MovieCardTest />} />
              </Routes>
            </Container>
          </Box>
        </ThemeProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
