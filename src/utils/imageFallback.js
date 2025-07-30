// Utility function to get fallback image URL from OMDb
const getOMDbPoster = async (title, year = '') => {
  try {
    const apiKey = import.meta.env.VITE_OMDB_API_KEY;
    if (!apiKey) {
      console.warn('OMDb API key is not set in environment variables');
      return null;
    }
    
    const response = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}${year ? `&y=${year}` : ''}&apikey=${apiKey}`
    );
    const data = await response.json();
    
    if (data.Poster && data.Poster !== 'N/A') {
      return data.Poster;
    }
  } catch (error) {
    console.error('Error fetching from OMDb:', error);
  }
  return null;
};

export { getOMDbPoster };
