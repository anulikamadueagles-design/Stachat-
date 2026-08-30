import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

const usersRef = collection(db, "users");

export async function saveUser(user) {
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      bio: "",
      phone: "",
      online: true,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function setUserOnline(uid) {
  await updateDoc(doc(db, "users", uid), {
    online: true,
    lastSeen: serverTimestamp(),
  });
}

export async function setUserOffline(uid) {
  await updateDoc(doc(db, "users", uid), {
    online: false,
    lastSeen: serverTimestamp(),
  });
}

export async function getUser(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getUsers() {
  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function searchUsers(text) {
  const q = query(
    usersRef,
    where("displayName", ">=", text),
    where("displayName", "<=", text + "\uf8ff")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
