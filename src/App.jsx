import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { RatingsProvider } from './context/RatingsContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import NotFound from './pages/NotFound/NotFound';
import RatingsPage from './pages/RatingsPage/RatingsPage';
import SearchResults from './pages/SearchResults/SearchResults';
import Login from './pages/Login/Login';
import DirectorPage from './pages/DirectorPage/DirectorPage';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import TestTMDB from './components/TestTMDB/TestTMDB';

function App() {
  return (
    <AuthProvider>
      <RatingsProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <Toaster position="top-right" />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/login" element={
                <ErrorBoundary>
                  <Login />
                </ErrorBoundary>
              } />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/movie/:id" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <MovieDetail />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/my-ratings" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <RatingsPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/director/:directorId" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <DirectorPage />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/search" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <SearchResults />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              
              {/* Test Route (Unprotected) */}
              <Route path="/test-tmdb" element={
                <ErrorBoundary>
                  <TestTMDB />
                </ErrorBoundary>
              } />
              
              {/* 404 Route - Must be last */}
              <Route path="*" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
            </Routes>
          </main>
        </div>
      </RatingsProvider>
    </AuthProvider>
  );
}

export default App;
