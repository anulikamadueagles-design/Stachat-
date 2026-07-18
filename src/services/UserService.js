import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../config/firebase";

const usersRef = collection(db, "users");

// Save or update a user
export async function saveUser(user) {

  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      online: true,
      lastSeen: serverTimestamp()
    },
    { merge: true }
  );

}

// Set user online
export async function setUserOnline(uid) {

  await updateDoc(
    doc(db, "users", uid),
    {
      online: true,
      lastSeen: serverTimestamp()
    }
  );

}

// Set user offline
export async function setUserOffline(uid) {

  await updateDoc(
    doc(db, "users", uid),
    {
      online: false,
      lastSeen: serverTimestamp()
    }
  );

}

// Get one user
export async function getUser(uid) {

  const snapshot = await getDoc(
    doc(db, "users", uid)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };

}

// Get all users
export async function getUsers() {

  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

}
