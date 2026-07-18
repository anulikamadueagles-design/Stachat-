import {
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

import { db } from "../config/firebase";

// Set user online
export async function goOnline(uid) {

  if (!uid) return;

  await updateDoc(
    doc(db, "users", uid),
    {
      online: true,
      lastSeen: serverTimestamp()
    }
  );

}

// Set user offline
export async function goOffline(uid) {

  if (!uid) return;

  await updateDoc(
    doc(db, "users", uid),
    {
      online: false,
      lastSeen: serverTimestamp()
    }
  );

}

// Listen for presence changes
export function subscribeToUserStatus(uid, callback) {

  return onSnapshot(
    doc(db, "users", uid),
    snapshot => {

      if (snapshot.exists()) {

        callback(snapshot.data());

      }

    }
  );

}
