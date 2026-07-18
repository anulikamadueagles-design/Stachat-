import React, {
  createContext,
  useEffect,
  useState
} from "react";

import { auth } from "../config/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";

import {
  saveUser,
  setUserOnline,
  setUserOffline
} from "../services/UserService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        if (currentUser) {

          await saveUser(currentUser);
          await setUserOnline(currentUser.uid);

        }

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
          email,
          password
        );

      await updateProfile(
        result.user,
        {
          displayName: name
        }
      );

      await saveUser({
        ...result.user,
        displayName: name
      });

      await setUserOnline(result.user.uid);

      setUser({
        ...result.user,
        displayName: name
      });

    } catch (error) {

      alert(error.message);

   
