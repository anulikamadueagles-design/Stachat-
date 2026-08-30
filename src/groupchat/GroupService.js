import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

const groupsRef = collection(db, "groups");

export async function createGroup(name, members, owner) {
  return await addDoc(groupsRef, {
    name,
    owner,
    members,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
    photoURL: "",
  });
}

// Only streams groups the given user actually belongs to, instead of
// every group in the app (which the old subscribeGroups() did, relying
// on the caller to filter client-side after downloading everything).
export function subscribeMyGroups(uid, callback) {
  const q = query(groupsRef, where("members", "array-contains", uid));

  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    groups.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );

    callback(groups);
  });
}

// ===============================
// GROUP MANAGEMENT
// ===============================

export async function addMember(groupId, uid) {
  const groupRef = doc(db, "groups", groupId);
  const snap = await getDoc(groupRef);

  if (!snap.exists()) return;

  const members = snap.data().members || [];

  if (!members.includes(uid)) {
    members.push(uid);
    await updateDoc(groupRef, {
      members,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function removeMember(groupId, uid) {
  const groupRef = doc(db, "groups", groupId);
  const snap = await getDoc(groupRef);

  if (!snap.exists()) return;

  const members = (snap.data().members || []).filter(
    (member) => member !== uid
  );

  await updateDoc(groupRef, {
    members,
    updatedAt: serverTimestamp(),
  });
}

export async function renameGroup(groupId, name) {
  await updateDoc(doc(db, "groups", groupId), {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function updateGroupPhoto(groupId, photoURL) {
  await updateDoc(doc(db, "groups", groupId), {
    photoURL,
    updatedAt: serverTimestamp(),
  });
}

export async function leaveGroup(groupId, uid) {
  await removeMember(groupId, uid);
}

export async function deleteGroup(groupId) {
  await deleteDoc(doc(db, "groups", groupId));
}
