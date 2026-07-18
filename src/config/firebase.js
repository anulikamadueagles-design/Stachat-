import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7alFkJH-QSXI1WM8zZayyoZWT_zL06T8",
  authDomain: "stachat-be4e5.firebaseapp.com",
  projectId: "stachat-be4e5",
  storageBucket: "stachat-be4e5.firebasestorage.app",
  messagingSenderId: "35450653073",
  appId: "1:35450653073:web:607cdd04dc522a4d9ff230"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
