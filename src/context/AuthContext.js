import React, { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      currentUser => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return unsubscribe;

  }, []);

  async function register(name, email, password) {

    try {

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

      await updateProfile(result.user, {
        displayName: name.trim()
      });

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          uid: result.user.uid,
          displayName: name.trim(),
          email: email.trim().toLowerCase(),
          photoURL: "",
          about: "Hey there! I'm using STAChat.",
          online: true,
          isAdmin: false,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp()
        },
        { merge: true }
      );

      setUser({
        ...result.user,
        displayName: name.trim()
      });

      return {
        success: true
      };

    } catch (error) {

      return {
        success: false,
        error: error.message
      };

    }

  }

  async function login(email, password) {

    try {

      const result =
        await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

      await updateDoc(
        doc(db, "users", result.user.uid),
        {
          online: true,
          lastSeen: serverTimestamp()
        }
      );

      setUser(result.user);

      return {
        success: true
      };

    } catch (error) {

      return {
        success: false,
        error: error.message
      };

    }

  }

  async function logout() {

    if (user) {

      await updateDoc(
        doc(db, "users", user.uid),
        {
          online: false,
          lastSeen: serverTimestamp()
        }
      );

    }

    await signOut(auth);

    setUser(null);

  }

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}
