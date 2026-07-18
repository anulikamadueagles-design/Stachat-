import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export async function createCall(callId, offer) {

  await setDoc(doc(db, "calls", callId), {
    offer,
    status: "calling",
    createdAt: serverTimestamp()
  });

}

export async function saveAnswer(callId, answer) {

  await updateDoc(doc(db, "calls", callId), {
    answer,
    status: "connected"
  });

}

export async function sendIceCandidate(callId, candidate) {

  await addDoc(
    collection(db, "calls", callId, "candidates"),
    candidate
  );

}

export function listenCall(callId, callback) {

  return onSnapshot(
    doc(db, "calls", callId),
    snapshot => {

      if (snapshot.exists()) {

        callback(snapshot.data());

      }

    }
  );

}

export function listenCandidates(callId, callback) {

  return onSnapshot(
    collection(db, "calls", callId, "candidates"),
    snapshot => {

      snapshot.docChanges().forEach(change => {

        if (change.type === "added") {

          callback(change.doc.data());

        }

      });

    }
  );

}
