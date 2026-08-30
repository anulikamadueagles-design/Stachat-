import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../config/firebase";

export async function sendOffer(callId, offer) {
  await setDoc(doc(db, "calls", callId), {
    offer,
    answer: null,
    status: "calling",
    createdAt: Date.now(),
  });
}

export async function sendAnswer(callId, answer) {
  await updateDoc(doc(db, "calls", callId), {
    answer,
    status: "connected",
  });
}

export async function subscribeCall(callId, callback) {
  return onSnapshot(doc(db, "calls", callId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
}

export async function getCall(callId) {
  const snapshot = await getDoc(doc(db, "calls", callId));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

export async function sendIceCandidate(
  callId,
  candidate,
  collectionName
) {
  await addDoc(
    collection(db, "calls", callId, collectionName),
    candidate.toJSON ? candidate.toJSON() : candidate
  );
}

export function subscribeIceCandidates(
  callId,
  collectionName,
  callback
) {
  return onSnapshot(
    collection(db, "calls", callId, collectionName),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          callback(change.doc.data());
        }
      });
    }
  );
}
