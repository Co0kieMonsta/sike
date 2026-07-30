"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const AuthContext = createContext({
  user: null,
  loading: true,
  logOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore in real-time
        try {
          unsubSnapshot = onSnapshot(collection(db, "system_users"), (querySnapshot) => {
            let matchedDoc = null;
            
            // 1. Try to find by UID
            matchedDoc = querySnapshot.docs.find(doc => doc.id === firebaseUser.uid);
            
            // 2. If not found by UID, try to find by email case-insensitively
            if (!matchedDoc && firebaseUser.email) {
              matchedDoc = querySnapshot.docs.find(doc => 
                doc.data().email?.toLowerCase() === firebaseUser.email.toLowerCase()
              );
            }

            if (matchedDoc) {
              setUser({
                ...firebaseUser,
                ...matchedDoc.data(),
                id: matchedDoc.id,
                name: matchedDoc.data().name || firebaseUser.displayName,
                image: matchedDoc.data().image || firebaseUser.photoURL,
                email: firebaseUser.email,
              });
            } else {
              setUser({
                ...firebaseUser,
                id: firebaseUser.uid,
                name: firebaseUser.displayName,
                image: firebaseUser.photoURL,
                email: firebaseUser.email,
              });
            }
            setLoading(false);
          }, (error) => {
            console.error("Error fetching user data:", error);
            setUser(firebaseUser);
            setLoading(false);
          });
        } catch (error) {
          console.error("Error setting up user snapshot:", error);
          setUser(firebaseUser);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        if (unsubSnapshot) unsubSnapshot();
      }
    });

    return () => {
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  const logOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
