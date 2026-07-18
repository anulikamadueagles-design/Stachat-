import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "../config/firebase";

const groupsRef = collection(db, "groups");

export async function createGroup(name, members, owner) {

  return await addDoc(groupsRef, {
    name,
    owner,
    members,
    createdAt: serverTimestamp(),
    lastMessage: ""
  });

}

export function subscribeGroups(callback) {

  const q = query(
    groupsRef,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, snapshot => {

    callback(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );

  });

}
