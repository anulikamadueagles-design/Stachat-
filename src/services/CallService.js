import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export async function startCall(callId, caller, receiver, type) {
  await setDoc(doc(db, "calls", callId), {
    callerId: caller.uid,
    callerName: caller.displayName || caller.email,
    receiverId: receiver.uid,
    receiverName: receiver.displayName || receiver.email,
    members: [caller.uid, receiver.uid],
    type,
    status: "ringing",
    createdAt: serverTimestamp(),
  });
}

export async function declineCall(callId) {
  await updateDoc(doc(db, "calls", callId), {
    status: "declined",
    endedAt: serverTimestamp(),
  });
}

export async function answerCall(callId) {
  await updateDoc(doc(db, "calls", callId), {
    status: "answered",
    answeredAt: serverTimestamp(),
  });
}

export async function endCall(callId) {
  await updateDoc(doc(db, "calls", callId), {
    status: "ended",
    endedAt: serverTimestamp(),
  });
}

export function listenCall(callId, callback) {
  return onSnapshot(doc(db, "calls", callId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
}

export async function deleteCall(callId) {
  await deleteDoc(doc(db, "calls", callId));
}
