import { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// Create a global style for the application
const GlobalStyle = createGlobalStyle`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Ensure input text is always visible */
  input {
    color: #333 !important;
  }
  
  /* Style the placeholder text */
  input::placeholder {
    color: #999 !important;
    opacity: 1;
  }
  
  /* For older browsers */
  input:-ms-input-placeholder {
    color: #999 !important;
  }
  
  input::-ms-input-placeholder {
    color: #999 !important;
  }
`;

// Create a styled component for the input
const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  color: #333 !important;
  background-color: #fff !important;
  outline: none;
  font-family: inherit;
  
  &::placeholder {
    color: #999;
  }
  
  &:-webkit-autofill,
  &:-webkit-autofill:hover, 
  &:-webkit-autofill:focus, 
  &:-webkit-autofill:active  {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #333 !important;
  }
`;

// Create a styled component for the button
const StyledButton = styled.button`
  padding: 0 2rem;
  height: 48px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Create a styled component for the spinner
const Spinner = styled.div`
  border: 3px solid rgba(0,0,0,0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4CAF50;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TestTMDB = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('inception');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Show the API key (first few chars for security)
    const key = import.meta.env.VITE_TMDB_API_KEY || '';
    setApiKey(key ? `${key.substring(0, 10)}...` : 'Not found');
  }, []);

  const testAPI = async () => {
    const searchQuery = query.trim();
    if (!searchQuery) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Testing TMDB API with query:', searchQuery);
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${
          import.meta.env.VITE_TMDB_API_KEY
        }&query=${encodeURIComponent(searchQuery)}`
      );
      
      console.log('Response status:', response.status);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.status_message || 'API request failed');
      }
      
      setData(result);
      console.log('TMDB API Response:', result);
    } catch (err) {
      console.error('TMDB API Error:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <GlobalStyle />
      <h1 style={{ 
        color: '#1a1a1a', 
        marginBottom: '1.5rem',
        borderBottom: '2px solid #eee',
        paddingBottom: '0.5rem'
      }}>
        TMDB API Test
      </h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <SearchInput
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && testAPI()}
          placeholder="Enter movie name"
        />
        <StyledButton 
          onClick={testAPI} 
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Search'}
        </StyledButton>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '4px',
        marginBottom: '1.5rem'
      }}>
        <p style={{ margin: '0', color: '#1a365d' }}>
          <strong>API Key Status:</strong> {apiKey ? '✅ Found' : '❌ Not found'}
          {apiKey && <span style={{ marginLeft: '1rem', opacity: 0.8, color: '#1a365d' }}>({apiKey})</span>}
        </p>
      </div>
      
      {error && (
        <div style={{ 
          color: '#721c24',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.95rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <strong>Error:</strong>
          </div>
          <div style={{ 
            fontFamily: 'monospace', 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            backgroundColor: 'rgba(0,0,0,0.05)',
            padding: '0.5rem',
            borderRadius: '4px',
            marginTop: '0.5rem',
            fontSize: '0.9em'
          }}>
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
            Please check your internet connection and try again. If the problem persists, verify your API key in the .env file.
          </div>
        </div>
      )}
      
      {isLoading && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#333'
        }}>
          <Spinner />
          <p>Searching TMDB...</p>
        </div>
      )}
      
      {data && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #eee'
          }}>
            <h3 style={{ margin: 0 }}>Results</h3>
            <span style={{ 
              backgroundColor: '#e9ecef',
              borderRadius: '12px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.85rem',
              color: '#212529'
            }}>
              {data.total_results} {data.total_results === 1 ? 'result' : 'results'} found
            </span>
          </div>
          
          <div style={{ 
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            padding: '1rem',
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid #e9ecef'
          }}>
            {data.results && data.results.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {data.results.map((movie) => (
                  <div 
                    key={movie.id}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      padding: '1rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {movie.poster_path && (
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                          alt={movie.title}
                          style={{
                            width: '46px',
                            height: '69px',
                            borderRadius: '4px',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1a365d' }}>
                          {movie.title} 
                          {movie.release_date && (
                            <span style={{ color: '#6c757d', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                              ({new Date(movie.release_date).getFullYear()})
                            </span>
                          )}
                        </h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                          {movie.overview && (
                            <span style={{ color: '#495057' }}>
                              {movie.overview.length > 200 
                                ? `${movie.overview.substring(0, 200)}...` 
                                : movie.overview}
                            </span>
                          )}
                        </p>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {movie.vote_average > 0 && (
                            <span style={{
                              backgroundColor: '#e9ecef',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              color: '#212529'
                            }}>
                              ⭐ {movie.vote_average.toFixed(1)}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#495057'
              }}>
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTMDB;
