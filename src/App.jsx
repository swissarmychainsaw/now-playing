import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import MovieCardTest from './pages/MovieCardTest/MovieCardTest';
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/movie-card-test" element={<MovieCardTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
