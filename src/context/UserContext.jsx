import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const UserContext = createContext();

// Note: Create a Firestore composite index for ratings with these fields:
// - userId (ascending)
// - movieId (ascending)
// - timestamp (descending)
// This can be done in the Firebase Console under Firestore > Indexes

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  // Load user ratings from Firestore
  const loadUserRatings = useCallback(async (userId) => {
    if (!userId) {
      setRatings({});
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setRatings(userDoc.data().ratings || {});
      } else {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', userId), {
          ratings: {},
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        setRatings({});
      }
    } catch (error) {
      console.error('Error loading user ratings:', error);
      setRatings({});
    }
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserRatings(user.uid);
      } else {
        setRatings({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserRatings]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          ratings: {},
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        // Update last login time
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        });
      }
      
      // Load user's ratings
      await loadUserRatings(user.uid);
      
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setRatings({});
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Rate a movie
  const rateMovie = async (movieId, rating) => {
    if (!user) {
      // Prompt user to sign in if not authenticated
      await signInWithGoogle();
      return;
    }

    const ratingData = {
      rating,
      timestamp: new Date().toISOString()
    };

    try {
      // Update local state optimistically
      setRatings(prev => ({
        ...prev,
        [movieId]: ratingData
      }));

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`ratings.${movieId}`]: ratingData
      });

    } catch (error) {
      console.error('Error rating movie:', error);
      // Revert optimistic update on error
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[movieId];
        return newRatings;
      });
      throw error;
    }
  };

  // Get user's rating for a specific movie
  const getRating = (movieId) => {
    return ratings[movieId]?.rating || 0;
  };

  return (
    <UserContext.Provider 
      value={{ 
        user,
        ratings,
        loading,
        signInWithGoogle,
        signOut,
        rateMovie,
        getRating,
        isAuthenticated: !!user
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
