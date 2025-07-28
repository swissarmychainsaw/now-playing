import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, initializeFirebase } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize Firebase
  useEffect(() => {
    try {
      initializeFirebase();
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!initialized) return;

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        loadUserPreferences(authUser.uid);
      }
    });

    return () => unsubscribe();
  }, [initialized]);

  const loadUserPreferences = async (userId) => {
    const userDoc = doc(db, 'users', userId);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setLikes(userData.likes || []);
      setDislikes(userData.dislikes || []);
    }
  };

  const updateLikes = async (movieId) => {
    if (!user || !movieId) return;

    try {
      const userDoc = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDoc);
      const userData = docSnap.data();
      
      // Get current likes/dislikes, ensuring they're always arrays
      const currentLikes = Array.isArray(userData?.likes) ? userData.likes : [];
      const currentDislikes = Array.isArray(userData?.dislikes) ? userData.dislikes : [];
      
      // If movie is already liked, remove it
      if (currentLikes.includes(movieId)) {
        const newLikes = currentLikes.filter(id => id !== movieId);
        await setDoc(userDoc, {
          likes: newLikes,
          lastUpdated: new Date()
        }, { merge: true });
        setLikes(newLikes); // Update local state
      } else {
        // If movie is disliked, remove it from dislikes first
        if (currentDislikes.includes(movieId)) {
          await setDoc(userDoc, {
            dislikes: currentDislikes.filter(id => id !== movieId),
            lastUpdated: new Date()
          }, { merge: true });
          setDislikes(currentDislikes.filter(id => id !== movieId)); // Update local state
        }
        // Then add it to likes
        const newLikes = [...currentLikes, movieId];
        await setDoc(userDoc, {
          likes: newLikes,
          lastUpdated: new Date()
        }, { merge: true });
        setLikes(newLikes); // Update local state
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const updateDislikes = async (movieId) => {
    if (!user || !movieId) return;

    try {
      const userDoc = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDoc);
      const userData = docSnap.data();
      
      // Get current likes/dislikes, ensuring they're always arrays
      const currentLikes = Array.isArray(userData?.likes) ? userData.likes : [];
      const currentDislikes = Array.isArray(userData?.dislikes) ? userData.dislikes : [];
      
      // If movie is already disliked, remove it
      if (currentDislikes.includes(movieId)) {
        const newDislikes = currentDislikes.filter(id => id !== movieId);
        await setDoc(userDoc, {
          dislikes: newDislikes,
          lastUpdated: new Date()
        }, { merge: true });
        setDislikes(newDislikes); // Update local state
      } else {
        // If movie is liked, remove it from likes first
        if (currentLikes.includes(movieId)) {
          await setDoc(userDoc, {
            likes: currentLikes.filter(id => id !== movieId),
            lastUpdated: new Date()
          }, { merge: true });
          setLikes(currentLikes.filter(id => id !== movieId)); // Update local state
        }
        // Then add it to dislikes
        const newDislikes = [...currentDislikes, movieId];
        await setDoc(userDoc, {
          dislikes: newDislikes,
          lastUpdated: new Date()
        }, { merge: true });
        setDislikes(newDislikes); // Update local state
      }
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, likes, dislikes, updateLikes, updateDislikes }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    console.warn('useUser was called outside of a UserProvider. Returning fallback.');
    return {
      user: null,
      likes: 0,
      dislikes: 0,
      updateLikes: () => {},
      updateDislikes: () => {}
    };
  }
  return context;
};
