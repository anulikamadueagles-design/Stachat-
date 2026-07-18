import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export async function startCall(callId, caller, receiver, type) {

  await setDoc(doc(db, "calls", callId), {

    callerId: caller.uid,
    callerName: caller.displayName,

    receiverId: receiver.uid,
    receiverName: receiver.displayName,

    type,

    status: "ringing",

    createdAt: serverTimestamp()

  });

}

export async function answerCall(callId) {

  await updateDoc(doc(db, "calls", callId), {

    status: "answered"

  });

}

export async function endCall(callId) {

  await deleteDoc(doc(db, "calls", callId));

}

export function listenCall(callId, callback) {

  return onSnapshot(

    doc(db, "calls", callId),

    snapshot => {

      callback(snapshot.data());

    }

  );

}
