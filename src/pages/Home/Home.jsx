import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../../components/SearchBox/SearchBox';
import RecommendationTabs from '../../components/RecommendationTabs/RecommendationTabs';
import MovieCard from '../../components/MovieCard/MovieCard';
import Rating from '../../components/Rating/Rating';
import { useUser } from '../../context/UserContext';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forYou');
  const [popularPage, setPopularPage] = useState(1);
  const [criticsPage, setCriticsPage] = useState(1);
  const [oscarPage, setOscarPage] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const { ratings, rateMovie } = useUser();
  const hasRatings = Object.keys(ratings).length > 0;
  
  // Get user rating for a specific movie with safe access
  const getRating = (movieId) => {
    try {
      return ratings?.[movieId] || 0;
    } catch (error) {
      console.error('Error getting rating:', error);
      return 0;
    }
  };
  const navigate = useNavigate();
  
  // Reset page counters if they get too high
  useEffect(() => {
    if (popularPage > 10) setPopularPage(1);
    if (criticsPage > 5) setCriticsPage(1);
  }, [popularPage, criticsPage]);
  
  // Curated list of recent Best Picture Oscar winners (TMDB movie IDs) with additional metadata
  const oscarWinners = [
    { id: 696374, year: 2023, title: 'Everything Everywhere All at Once' },
    { id: 453395, year: 2022, title: 'CODA' },
    { id: 19404, year: 2021, title: 'Nomadland' },
    { id: 496243, year: 2020, title: 'Parasite' },
    { id: 450465, year: 2019, title: 'Green Book' },
    { id: 399055, year: 2018, title: 'The Shape of Water' },
    { id: 313369, year: 2017, title: 'Moonlight' },
    { id: 314365, year: 2016, title: 'Spotlight' },
    { id: 194662, year: 2015, title: 'Birdman' },
    { id: 76203, year: 2014, title: '12 Years a Slave' },
    { id: 68721, year: 2013, title: 'Argo' },
    { id: 68718, year: 2012, title: 'The Artist' },
    { id: 45269, year: 2011, title: "The King's Speech" },
    { id: 12162, year: 2010, title: 'The Hurt Locker' },
    { id: 16869, year: 2009, title: 'Slumdog Millionaire' },
    { id: 6977, year: 2008, title: 'No Country for Old Men' },
    { id: 1422, year: 2007, title: 'The Departed' },
    { id: 1640, year: 2006, title: 'Crash' },
    { id: 70, year: 2005, title: 'Million Dollar Baby' },
    { id: 322, year: 2004, title: 'The Lord of the Rings: The Return of the King' },
  ].sort((a, b) => b.year - a.year); // Sort by most recent first
  
  // Get current page of Oscar winners (5 per page)
  const getOscarWinnersPage = useCallback((page) => {
    const start = page * 5;
    return oscarWinners.slice(start, start + 5);
  }, [oscarWinners]);
  
  // Fetch details for Oscar winners
  const fetchOscarWinners = useCallback(async (winners) => {
    try {
      const moviePromises = winners.map(winner => 
        fetch(`https://api.themoviedb.org/3/movie/${winner.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`)
          .then(res => res.ok ? res.json().then(movie => ({
            ...movie,
            // Add year and original title from our winners list
            release_year: winner.year,
            original_title: winner.title
          })) : null)
          .catch(() => null)
      );
      
      const results = await Promise.all(moviePromises);
      return results.filter(movie => movie !== null);
    } catch (error) {
      console.error('Error fetching Oscar winners:', error);
      return [];
    }
  }, []);

  // Sample movie data for different categories
  const sampleMovies = {
    forYou: [
      {
        id: 238,  // The Godfather
        title: 'The Godfather',
        release_date: '1972-03-24',
        vote_average: 8.7,
        poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
      },
      {
        id: 155,  // The Dark Knight
        title: 'The Dark Knight',
        release_date: '2008-07-16',
        vote_average: 8.5,
        poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
      },
      {
        id: 680,  // Pulp Fiction
        title: 'Pulp Fiction',
        release_date: '1994-10-14',
        vote_average: 8.5,
        poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.'
      },
      {
        id: 122,  // The Lord of the Rings: The Return of the King
        title: 'The Lord of the Rings: The Return of the King',
        release_date: '2003-12-01',
        vote_average: 8.5,
        poster_path: '/rCzpD3bwVdNaNH1u4WXNN9wme1j.jpg',
        overview: 'Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron.'
      },
      {
        id: 13,  // Forrest Gump
        title: 'Forrest Gump',
        release_date: '1994-07-06',
        vote_average: 8.5,
        poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        overview: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.'
      }
    ],
    oscarWinners: [
      {
        id: 278,  // The Shawshank Redemption
        title: 'The Shawshank Redemption',
        release_date: '1994-09-23',
        vote_average: 8.7,
        poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
      },
      {
        id: 550,  // Fight Club
        title: 'Fight Club',
        release_date: '1999-10-15',
        vote_average: 8.4,
        poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.'
      },
      {
        id: 18,  // The Silence of the Lambs
        title: 'The Silence of the Lambs',
        release_date: '1991-02-01',
        vote_average: 8.3,
        poster_path: '/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg',
        overview: 'Clarice Starling is a top student at the FBI\'s training academy. Jack Crawford wants Clarice to interview Dr. Hannibal Lecter, a brilliant psychiatrist who is also a violent psychopath, serving life behind bars for various acts of murder and cannibalism.'
      },
      {
        id: 335983,  // Joker
        title: 'Joker',
        release_date: '2019-10-02',
        vote_average: 8.2,
        poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
        overview: 'During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.'
      },
      {
        id: 244786,  // Whiplash
        title: 'Whiplash',
        release_date: '2014-10-10',
        vote_average: 8.4,
        poster_path: '/7fn624j5kj3xTme2SwiGBtWViQ0.jpg',
        overview: 'Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.'
      }
    ],
    popular: [
      {
        id: 299536,  // Avengers: Infinity War
        title: 'Avengers: Infinity War',
        release_date: '2018-04-25',
        vote_average: 8.2,
        poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
        overview: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.'
      },
      {
        id: 299534,  // Avengers: Endgame
        title: 'Avengers: Endgame',
        release_date: '2019-04-24',
        vote_average: 8.3,
        poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.'
      },
      {
        id: 157336,  // Interstellar
        title: 'Interstellar',
        release_date: '2014-11-05',
        vote_average: 8.4,
        poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.'
      },
      {
        id: 496243,  // Parasite
        title: 'Parasite',
        release_date: '2019-05-30',
        vote_average: 8.5,
        poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.'
      },
      {
        id: 19404,  // Dilwale Dulhania Le Jayenge
        title: 'Dilwale Dulhania Le Jayenge',
        release_date: '1995-10-20',
        vote_average: 8.7,
        poster_path: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
        overview: 'Raj is a rich, carefree, happy-go-lucky second generation NRI. Simran is the daughter of Chaudhary Baldev Singh, who in spite of being an NRI is very strict about adherence to Indian values. Simran has left for India to be married to her childhood fiancé. Raj leaves for India with a mission at his hands, to claim his lady love under the noses of her whole family. Thus begins a saga.'
      }
    ],
    criticsPicks: [
      {
        id: 129,  // Spirited Away
        title: 'Spirited Away',
        release_date: '2001-07-20',
        vote_average: 8.5,
        poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
        overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.'
      },
      {
        id: 496784,  // The Father
        title: 'The Father',
        release_date: '2020-12-23',
        vote_average: 8.3,
        poster_path: '/pr3bEQ517uMb5loLvjFQi8uLAsp.jpg',
        overview: 'A man refuses all assistance from his daughter as he ages and, as he tries to make sense of his changing circumstances, he begins to doubt his loved ones, his own mind and even the fabric of his reality.'
      },
      {
        id: 19404,  // Dilwale Dulhania Le Jayenge
        title: 'Dilwale Dulhania Le Jayenge',
        release_date: '1995-10-20',
        vote_average: 8.7,
        poster_path: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
        overview: 'Raj is a rich, carefree, happy-go-lucky second generation NRI. Simran is the daughter of Chaudhary Baldev Singh, who in spite of being an NRI is very strict about adherence to Indian values. Simran has left for India to be married to her childhood fiancé. Raj leaves for India with a mission at his hands, to claim his lady love under the noses of her whole family. Thus begins a saga.'
      },
      {
        id: 496243,  // Parasite
        title: 'Parasite',
        release_date: '2019-05-30',
        vote_average: 8.5,
        poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.'
      },
      {
        id: 13,  // Forrest Gump
        title: 'Forrest Gump',
        release_date: '1994-07-06',
        vote_average: 8.5,
        poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        overview: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.'
      }
    ]
  };

  // Fetch genre list from TMDB
  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
      );
      const data = await response.json();
      return data.genres || [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  };

  // Helper function to get genre names from genre IDs with safe access
  const getGenreNames = useCallback((genreIds) => {
    try {
      if (!genreIds || !Array.isArray(genreIds)) return [];
      
      // Define a static list of common genres
      const staticGenres = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
      ];
      
      return genreIds
        .map(id => staticGenres.find(g => g.id === id)?.name)
        .filter(Boolean);
    } catch (error) {
      console.error('Error getting genre names:', error);
      return [];
    }
  }, []);



  // Fetch trending movies for the "For You" tab
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const data = await response.json();
        setTrendingMovies(data.results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching trending movies:', error);
      }
    };

    if (activeTab === 'forYou' && !hasRatings) {
      fetchTrending();
    }
  }, [activeTab, hasRatings]);

  // Generate personalized recommendations based on user ratings
  useEffect(() => {
    const generatePersonalizedRecs = async () => {
      if (!hasRatings) return;
      
      try {
        // Get top-rated genres from user's ratings
        const genreCounts = {};
        const ratedMovieIds = Object.keys(ratings);
        
        // Fetch details for each rated movie to get genres
        const moviesDetails = await Promise.all(
          ratedMovieIds.map(id => 
            fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          )
        );
        
        // Count genre occurrences
        moviesDetails.forEach(movie => {
          if (movie?.genres) {
            movie.genres.forEach(genre => {
              genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1;
            });
          }
        });
        
        // Get top 3 genres
        const topGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id);
        
        // Fetch recommendations based on top genres
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}` +
          `&sort_by=popularity.desc&with_genres=${topGenres.join(',')}`
        );
        
        const data = await response.json();
        setPersonalizedRecs(data.results.slice(0, 5));
        
      } catch (error) {
        console.error('Error generating recommendations:', error);
      }
    };
    
    if (activeTab === 'forYou' && hasRatings) {
      generatePersonalizedRecs();
    }
  }, [activeTab, hasRatings, ratings]);

  // Memoized fetchMovies function
  const fetchMovies = useCallback(async (currentTab = activeTab) => {
    if (!currentTab) return; // Skip if no tab is specified
    
    try {
      setLoading(true);
      let apiUrl;
      let processMovies = [];
      
      // Handle different tabs
      if (currentTab === 'forYou') {
        // Show either personalized recs or trending movies
        const moviesToShow = hasRatings ? personalizedRecs : trendingMovies;
        if (moviesToShow.length > 0) {
          setMovies(moviesToShow.map(movie => ({
            ...movie,
            genre_names: getGenreNames(movie.genre_ids || [])
          })));
          setLoading(false);
          return;
        }
      } else if (tab === 'oscarWinners') {
        // Get current page of Oscar winners (cycle through pages)
        const totalPages = Math.ceil(oscarWinners.length / 5);
        const currentPage = oscarPage % totalPages;
        const currentPageWinners = getOscarWinnersPage(currentPage);
        
        // Fetch details for these movies
        const winners = await fetchOscarWinners(currentPageWinners);
        
        // Process with genres and mark as Oscar winners
        processMovies = winners.map((movie, index) => {
          const winnerInfo = currentPageWinners[index] || {};
          return {
            ...movie,
            title: winnerInfo.year ? `${movie.title} (${winnerInfo.year})` : movie.title,
            genre_names: getGenreNames(movie.genre_ids || []),
            is_oscar_winner: true,
            vote_average: movie.vote_average || 0,
            release_date: movie.release_date || `${winnerInfo.year}-01-01`
          };
        });
        
      } else if (tab === 'criticsPicks') {
        // Fetch top-rated movies from TMDB for Critics' Picks with pagination
        apiUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=${criticsPage}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch top-rated movies');
        
        const data = await response.json();
        
        // Process movies for Critics' Picks
        processMovies = data.results
          .filter(movie => movie && movie.vote_average >= 7.5 && movie.poster_path)
          .sort((a, b) => b.vote_count - a.vote_count)
          .map(movie => ({
            ...movie,
            genre_names: getGenreNames(movie.genre_ids || [])
          }));
        
        // Reset to page 1 if we've reached the end
        if (data.page >= data.total_pages) {
          setCriticsPage(1);
        } else {
          setCriticsPage(prev => prev + 1);
        }
            
      } else if (tab === 'popular') {
        // Fetch popular movies from TMDB with pagination
        apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=${popularPage}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch popular movies');
        
        const data = await response.json();
        
        // Process popular movies (no need for filtering by rating)
        processMovies = data.results
          .sort((a, b) => b.popularity - a.popularity);
            
        // Increment page for next time
        setPopularPage(prev => prev + 1);
            
      } else {
        // Use sample data for other tabs
        setMovies(sampleMovies[tab] || []);
        return;
      }
        
      // Process and set the movies
      const processedMovies = processMovies
        .slice(0, 5) // Get top 5
        .map(movie => ({
          ...movie,
          genre_names: getGenreNames(movie.genre_ids)
        }));
          
      setMovies(processedMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      // Fallback to sample data if API call fails
      setMovies(sampleMovies[tab] || []);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab, 
    popularPage, 
    criticsPage, 
    oscarPage, 
    hasRatings, 
    personalizedRecs, 
    trendingMovies, 
    getGenreNames, 
    oscarWinners, 
    getOscarWinnersPage, 
    fetchOscarWinners
  ]);
  


  // Load movies when active tab changes or when pagination changes
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    
    // Only fetch if we have an active tab
    if (activeTab) {
      fetchMovies(activeTab, { signal }).catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching movies:', error);
        }
      });
    }
    
    return () => {
      controller.abort();
    };
  }, [activeTab, popularPage, criticsPage, oscarPage]);

  // Filter movies based on search query with safe property access
  const filteredMovies = movies.filter(movie => {
    try {
      const searchLower = searchQuery.toLowerCase();
      return (
        movie?.title?.toLowerCase().includes(searchLower) ||
        movie?.overview?.toLowerCase().includes(searchLower) ||
        false
      );
    } catch (error) {

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch top-rated movies');

    const data = await response.json();

    // Process movies for Critics' Picks
    processMovies = data.results
      .filter(movie => movie && movie.vote_average >= 7.5 && movie.poster_path)
      .sort((a, b) => b.vote_count - a.vote_count)
      .map(movie => ({
        ...movie,
        genre_names: getGenreNames(movie.genre_ids || [])
      }));

    // Reset to page 1 if we've reached the end
    if (data.page >= data.total_pages) {
      setCriticsPage(1);
    } else {
      setCriticsPage(prev => prev + 1);
    }

  } else if (tab === 'popular') {
    // Fetch popular movies from TMDB with pagination
    apiUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=${popularPage}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch popular movies');

    const data = await response.json();

    // Process popular movies (no need for filtering by rating)
    processMovies = data.results
      .sort((a, b) => b.popularity - a.popularity);

    // Increment page for next time
    setPopularPage(prev => prev + 1);

  } else {
    // Use sample data for other tabs
    setMovies(sampleMovies[tab] || []);
    return;
  }

  // Process and set the movies
  const processedMovies = processMovies
    .slice(0, 5) // Get top 5
    .map(movie => ({
      ...movie,
      genre_names: getGenreNames(movie.genre_ids)
    }));

  setMovies(processedMovies);
} catch (error) {
  console.error('Error fetching movies:', error);
  // Fallback to sample data if API call fails
  setMovies(sampleMovies[tab] || []);
} finally {
  setLoading(false);
}
}, [
  activeTab, 
  popularPage, 
  criticsPage, 
  oscarPage, 
  hasRatings, 
  personalizedRecs, 
  trendingMovies, 
  getGenreNames, 
  oscarWinners, 
  getOscarWinnersPage, 
  fetchOscarWinners
]);

// Load movies when active tab changes or when pagination changes
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  // Only fetch if we have an active tab
  if (activeTab) {
    fetchMovies(activeTab, { signal }).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error fetching movies:', error);
      }
    });
  }

  return () => {
    controller.abort();
    // Show success feedback
    toast.success(`Rated ${rating} stars!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add padding to account for fixed header */}
      <div className="pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section with Search */}
          <section className="mb-12 text-center pt-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4 max-w-3xl mx-auto leading-tight">
              {hasRatings ? 'Your Personal Recommendations' : 'Rate movies to get personalized recommendations'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {hasRatings ? 'Movies we think you\'ll love' : 'Search by title, genre, or actor'}
            </p>
            
            <div className="max-w-2xl mx-auto mb-12">
              <SearchBox 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for movies..."
              />
            </div>
          </section>

          {/* Recommendation Tabs */}
          <section className="mb-8 bg-white shadow-sm rounded-lg p-1">
            <div className="max-w-4xl mx-auto">
              <RecommendationTabs 
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
          </section>

          {/* Movie Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {activeTab === 'forYou' && (hasRatings ? 'Recommended For You' : 'Trending Movies to Rate')}
              {activeTab === 'oscarWinners' && 'Oscar Winners'}
              {activeTab === 'popular' && 'Popular Now'}
              {activeTab === 'criticsPicks' && 'Critics\' Picks'}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capri"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {activeTab === 'forYou' && !hasRatings ? (
                  // Show trending movies with rating options
                  trendingMovies.length > 0 ? (
                    trendingMovies.map((movie) => {
                      const movieWithRating = {
                        ...movie,
                        genre_names: movie.genre_ids ? getGenreNames(movie.genre_ids) : [],
                        user_rating: getRating(movie.id)
                      };
                      return (
                        <MovieCard 
                          key={movie.id}
                          movie={movieWithRating}
                          showRating={true}
                          onClick={() => navigate(`/movie/${movie.id}`)}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">Loading trending movies...</p>
                    </div>
                  )
                ) : (
                  // Default movie grid for other tabs
                  filteredMovies.map((movie) => {
                    const movieWithRating = {
                      ...movie,
                      user_rating: getRating(movie.id)
                    };
                    return (
                      <MovieCard 
                        key={movie.id}
                        movie={movieWithRating}
                        showRating={true}
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      />
                    );
                  })
                )}
                
                {/* Skeleton loaders for consistent grid layout */}
                {loading && Array(5).fill(0).map((_, index) => (
                  <div key={`skeleton-${index}`} className="bg-gray-200 rounded-lg aspect-[2/3] animate-pulse"></div>
                ))}
              </div>
            )}
            
            {activeTab === 'forYou' && !hasRatings && !loading && trendingMovies.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No trending movies found. Please try again later.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
