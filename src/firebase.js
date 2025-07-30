// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  onSnapshot
} from "firebase/firestore";

// Your web app's Firebase configuration
// Make sure these environment variables are set in your .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "now-playing-bc436.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "now-playing-bc436",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "now-playing-bc436.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required config
if (!firebaseConfig.apiKey) {
  console.error('Missing Firebase configuration. Please check your .env file.');
  throw new Error('Firebase configuration is missing required fields');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Function to get user's ratings
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
        createdAt: new Date().toISOString()
      });
      return {};
    }
    return userDoc.data().ratings || {};
  } catch (error) {
    console.error('Error getting user ratings:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Function to update a user's rating
export const updateUserRating = async (userId, movieId, ratingData) => {
  if (!userId || !movieId) {
    console.warn('Missing required parameters for updateUserRating');
    return false;
  }

  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, 
      {
        [`ratings.${movieId}`]: ratingData,
        lastUpdated: new Date().toISOString()
      },
      { merge: true } // Merge with existing document
    );
    return true;
  } catch (error) {
    console.error('Error updating user rating:', error);
    throw error;
  }
};

// Real-time listener for user data
export const setupUserListener = (userId, callback) => {
  if (!userId) {
    console.warn('Cannot set up user listener: No user ID provided');
    return () => {};
  }

  const userRef = doc(db, 'users', userId);
  
  // Set up the listener
  const unsubscribe = onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        // Document doesn't exist, create it
        setDoc(userRef, { ratings: {}, createdAt: new Date().toISOString() })
          .then(() => callback({ ratings: {} }))
          .catch(console.error);
      }
    },
    (error) => {
      console.error('Error in user listener:', error);
    }
  );

  return unsubscribe;
};

// Auth state change handler
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

export default app;
