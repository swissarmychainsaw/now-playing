import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';

/**
 * Save or update a user's rating for a movie
 * @param {string} userId - The ID of the user
 * @param {string} movieId - The ID of the movie
 * @param {number} rating - The rating value (1-5)
 * @param {Object} movieData - Additional movie data to store with the rating
 * @returns {Promise<boolean>} - Returns true if successful
 */
export const saveRating = async (userId, movieId, rating, movieData = {}) => {
  if (!userId || !movieId || rating === undefined) {
    console.error('Missing required parameters for saveRating');
    throw new Error('Missing required parameters');
  }

  if (rating < 1 || rating > 5) {
    console.error('Invalid rating value. Must be between 1 and 5');
    throw new Error('Rating must be between 1 and 5');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const ratingData = {
      movieId,
      rating,
      ...movieData,
      ratedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Use setDoc with merge to create or update the document
    await setDoc(
      userRef,
      {
        [`ratings.${movieId}`]: ratingData,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error('Error saving rating:', error);
    throw error;
  }
};

/**
 * Remove a user's rating for a movie
 * @param {string} userId - The ID of the user
 * @param {string} movieId - The ID of the movie to remove the rating for
 * @returns {Promise<boolean>} - Returns true if successful
 */
export const removeRating = async (userId, movieId) => {
  if (!userId || !movieId) {
    console.error('Missing required parameters for removeRating');
    throw new Error('Missing required parameters');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return true; // Nothing to remove
    }

    const userData = userDoc.data();
    if (!userData.ratings || !userData.ratings[movieId]) {
      return true; // Rating doesn't exist
    }

    // Remove the rating
    const updatedRatings = { ...userData.ratings };
    delete updatedRatings[movieId];

    await updateDoc(userRef, {
      ratings: updatedRatings,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error removing rating:', error);
    throw error;
  }
};

/**
 * Get all ratings for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - Object with movieId as keys and rating data as values
 */
export const getUserRatings = async (userId) => {
  if (!userId) {
    console.warn('No user ID provided to getUserRatings');
    return {};
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', userId), {
        ratings: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {};
    }
    return userDoc.data().ratings || {};
  } catch (error) {
    console.error('Error getting user ratings:', error);
    throw error;
  }
};

/**
 * Get a user's rating for a specific movie
 * @param {string} userId - The ID of the user
 * @param {string} movieId - The ID of the movie
 * @returns {Promise<Object|null>} - The rating data or null if not found
 */
export const getUserRatingForMovie = async (userId, movieId) => {
  if (!userId || !movieId) {
    console.warn('Missing required parameters for getUserRatingForMovie');
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    
    const ratings = userDoc.data().ratings || {};
    return ratings[movieId] || null;
  } catch (error) {
    console.error('Error getting user rating for movie:', error);
    throw error;
  }
};

/**
 * Set up a real-time listener for a user's ratings
 * @param {string} userId - The ID of the user
 * @param {Function} callback - Function to call when ratings change
 * @returns {Function} - Unsubscribe function
 */
export const onRatingsChange = (userId, callback) => {
  if (!userId) {
    console.warn('Cannot set up ratings listener: No user ID provided');
    return () => {};
  }

  const userRef = doc(db, 'users', userId);
  
  const unsubscribe = onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data().ratings || {});
      } else {
        // Document doesn't exist, create it
        setDoc(userRef, { 
          ratings: {}, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
          .then(() => callback({}))
          .catch(console.error);
      }
    },
    (error) => {
      console.error('Error in ratings listener:', error);
    }
  );

  return unsubscribe;
};
