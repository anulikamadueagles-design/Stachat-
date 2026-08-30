import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { db, storage } from "../config/firebase";

export async function uploadStatus(user, file, mediaType = "image") {
  const response = await fetch(file.uri);
  const blob = await response.blob();

  const storageRef = ref(
    storage,
    `status/${user.uid}/${Date.now()}`
  );

  await uploadBytes(storageRef, blob);

  const mediaUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "status"), {
    uid: user.uid,
    name: user.displayName || user.email,
    mediaUrl,
    mediaType,
    storagePath: storageRef.fullPath,
    viewedBy: [],
    createdAt: serverTimestamp(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
}

export function subscribeStatus(callback) {
  const q = query(
    collection(db, "status"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  });
}

export async function markStatusViewed(statusId, uid) {
  const statusRef = doc(db, "status", statusId);

  await updateDoc(statusRef, {
    viewedBy: arrayUnion(uid),
  });
}

export async function deleteStatus(statusId, storagePath) {
  if (storagePath) {
    const mediaRef = ref(storage, storagePath);
    await deleteObject(mediaRef);
  }

  await deleteDoc(doc(db, "status", statusId));
}
