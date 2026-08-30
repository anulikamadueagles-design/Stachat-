import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7alFkJH-QSXI1WM8zZayyoZWT_zL06T8",
  authDomain: "stachat-be4e5.firebaseapp.com",
  projectId: "stachat-be4e5",
  storageBucket: "stachat-be4e5.firebasestorage.app",
  messagingSenderId: "35450653073",
  appId: "1:35450653073:web:607cdd04dc522a4d9ff230"
};

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
