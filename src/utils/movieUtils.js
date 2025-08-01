/**
 * Formats a movie's release year from its release date
 * @param {string} releaseDate - The movie's release date in YYYY-MM-DD format
 * @returns {string} The formatted year or empty string if invalid
 */
export const getReleaseYear = (releaseDate) => {
  if (!releaseDate) return '';
  const date = new Date(releaseDate);
  return isNaN(date.getTime()) ? '' : date.getFullYear().toString();
};

/**
 * Formats a movie's runtime in minutes to a human-readable format (e.g., "2h 15m")
 * @param {number} minutes - The movie's runtime in minutes
 * @returns {string} The formatted runtime or empty string if invalid
 */
export const formatRuntime = (minutes) => {
  if (!minutes && minutes !== 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/**
 * Gets the full image URL for a TMDB image path
 * @param {string} path - The image path from TMDB
 * @param {string} size - The image size (e.g., 'w500', 'original')
 * @returns {string} The full image URL or a placeholder if no path is provided
 */
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

/**
 * Formats a movie's rating to a percentage
 * @param {number} voteAverage - The movie's vote average (0-10)
 * @returns {number} The formatted percentage (0-100)
 */
export const formatRating = (voteAverage) => {
  if (!voteAverage && voteAverage !== 0) return 0;
  return Math.round(voteAverage * 10);
};

/**
 * Truncates text to a specified length and adds an ellipsis if needed
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length of the text
 * @returns {string} The truncated text with an ellipsis if needed
 */
export const truncateText = (text = '', maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
};

/**
 * Gets the age rating for a movie based on its release dates
 * @param {Array} releaseDates - The movie's release dates from TMDB
 * @param {string} country - The country code (default: 'US')
 * @returns {string} The age rating or 'N/A' if not available
 */
export const getAgeRating = (releaseDates = [], country = 'US') => {
  if (!releaseDates.length) return 'N/A';
  
  // Try to find the US certification first
  const usRelease = releaseDates.find(rd => rd.iso_3166_1 === country);
  if (usRelease?.release_dates?.[0]?.certification) {
    return usRelease.release_dates[0].certification;
  }
  
  // If no US certification, try to find any certification
  for (const release of releaseDates) {
    if (release.release_dates?.[0]?.certification) {
      return release.release_dates[0].certification;
    }
  }
  
  return 'N/A';
};

/**
 * Formats a number with commas as thousands separators
 * @param {number} number - The number to format
 * @returns {string} The formatted number or 'N/A' if invalid
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return 'N/A';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Gets the primary genre name from a list of genres
 * @param {Array} genres - The movie's genres
 * @returns {string} The primary genre name or empty string if not available
 */
export const getPrimaryGenre = (genres = []) => {
  if (!genres.length) return '';
  return genres[0]?.name || '';
};

export default {
  getReleaseYear,
  formatRuntime,
  getImageUrl,
  formatRating,
  truncateText,
  getAgeRating,
  formatNumber,
  getPrimaryGenre,
};
