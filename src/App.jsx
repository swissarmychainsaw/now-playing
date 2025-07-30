import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext';
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
    <UserProvider>
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
            
            {/* Redirect all other routes to home */}
            <Route path="*" element={
              <ErrorBoundary>
                <Navigate to="/" replace />
              </ErrorBoundary>
            } />
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
}

export default App;
