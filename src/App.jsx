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
import Login from './pages/Login/Login';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <RatingsProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <Toaster position="top-right" />
          <main className="flex-grow">
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
              
              <Route path="/404" element={
                <ErrorBoundary>
                  <NotFound />
                </ErrorBoundary>
              } />
              
              {/* Redirect all other routes to home */}
              <Route path="*" element={
                <Navigate to="/404" replace />
              } />
            </Routes>
          </main>
        </div>
      </RatingsProvider>
    </AuthProvider>
  );
}

export default App;
