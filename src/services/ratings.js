import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  onSnapshot,
  deleteField 
} from 'firebase/firestore';

/**
 * Save or update a user's rating for a movie
 * @param {string} userId - The ID of the user
 * @param {string} movieId - The ID of the movie
 * @param {number} rating - The rating value (1-5)
 * @param {Object} movieData - Additional movie data to store with the rating
 * @returns {Promise<boolean>} - Returns true if successful
 */
export const saveRating = async (userId, movieId, rating, movieData = {}) => {
  console.log(`Saving rating - User: ${userId}, Movie: ${movieId}, Rating: ${rating}`);
  
  if (!userId || !movieId || rating === undefined) {
    const error = new Error('Missing required parameters for saveRating');
    console.error(error.message, { userId, movieId, rating });
    throw error;
  }

  // Special status values: -1 for not interested, -2 for want to watch
  const validStatusValues = [-2, -1, 0, 1, 2, 3, 4, 5];
  if (!validStatusValues.includes(rating)) {
    const error = new Error('Invalid rating value. Must be between 0 and 5, or -1 (not interested) or -2 (want to watch)');
    console.error(error.message, { rating });
    throw error;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const ratingData = {
      movieId,
      status: rating === 0 ? 'not_rated' : 
              rating === -1 ? 'not_interested' :
              rating === -2 ? 'want_to_watch' : 'rated',
      rating: rating > 0 ? rating : null,
      ...movieData,
      ratedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Saving rating data:', { userId, movieId, ratingData });

    // First, get the current document to check if it exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('Creating new user document');
      // Create the document with initial data if it doesn't exist
      await setDoc(userRef, {
        ratings: { [movieId]: ratingData },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      console.log('Updating existing user document');
      // Update the document
      const updateData = {
        updatedAt: serverTimestamp()
      };
      
      if (rating === 0) {
        // Remove the rating if rating is 0
        updateData[`ratings.${movieId}`] = deleteField();
      } else {
        // Update the rating
        updateData[`ratings.${movieId}`] = ratingData;
      }
      
      await updateDoc(userRef, updateData);
    }

    console.log('Rating saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving rating:', {
      error: error.message,
      stack: error.stack,
      userId,
      movieId,
      rating,
      movieData
    });
    throw new Error('Failed to save rating. Please try again.');
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
 * @param {Function} onNext - Function to call when ratings change
 * @param {Function} [onError] - Optional error callback
 * @returns {Function} - Unsubscribe function
 */
export const onRatingsChange = (userId, onNext, onError) => {
  console.log('Setting up ratings listener for user:', userId);
  
  if (!userId) {
    const error = new Error('Cannot set up ratings listener: No user ID provided');
    console.warn(error.message);
    if (onError) onError(error);
    return () => {};
  }

  const userRef = doc(db, 'users', userId);
  
  try {
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        try {
          console.log('Received ratings update:', doc.exists() ? 'Document exists' : 'Document does not exist');
          
          if (doc.exists()) {
            const data = doc.data();
            console.log('Ratings data:', data?.ratings || 'No ratings found');
            onNext(data?.ratings || {});
          } else {
            console.log('User document does not exist, creating...');
            // Document doesn't exist, create it
            setDoc(userRef, { 
              ratings: {}, 
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
              .then(() => {
                console.log('Created new user document with empty ratings');
                onNext({});
              })
              .catch(error => {
                console.error('Error creating user document:', error);
                if (onError) onError(error);
              });
          }
        } catch (error) {
          console.error('Error processing ratings snapshot:', {
            error: error.message,
            stack: error.stack,
            userId
          });
          if (onError) onError(error);
        }
      },
      (error) => {
        console.error('Error in ratings listener:', {
          error: error.message,
          code: error.code,
          stack: error.stack,
          userId
        });
        if (onError) onError(error);
      }
    );

    console.log('Successfully set up ratings listener');
    return () => {
      console.log('Cleaning up ratings listener');
      unsubscribe();
    };
  } catch (error) {
    console.error('Failed to set up ratings listener:', {
      error: error.message,
      stack: error.stack,
      userId
    });
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Clear all ratings for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<boolean>} - Returns true if successful
 */
export const clearAllRatings = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to clear ratings');
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    // First get all ratings to delete them properly
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.log('No user document found, nothing to clear');
      return true;
    }
    
    const userData = userDoc.data();
    if (!userData.ratings) {
      console.log('No ratings found to clear');
      return true;
    }
    
    // Create an update object to clear all ratings
    const updates = {};
    Object.keys(userData.ratings).forEach(movieId => {
      updates[`ratings.${movieId}`] = deleteField();
    });
    
    // Also clear the ratedMovies array if it exists
    if (userData.ratedMovies) {
      updates.ratedMovies = [];
    }
    
    // Apply the updates
    await updateDoc(userRef, updates);
    console.log(`Successfully cleared all ratings for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error clearing ratings:', error);
    throw new Error('Failed to clear ratings: ' + error.message);
  }
};

