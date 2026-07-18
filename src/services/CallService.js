import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../config/firebase";

export async function startVoiceCall(caller, receiver) {

  const callId =
    `${caller.uid}_${receiver.uid}_${Date.now()}`;

  await setDoc(
    doc(db, "calls", callId),
    {
      id: callId,
      type: "voice",
      callerUid: caller.uid,
      callerName:
        caller.displayName || caller.email,
      receiverUid: receiver.uid,
      receiverName:
        receiver.displayName || receiver.email,
      status: "ringing",
      createdAt: serverTimestamp()
    }
  );

  return callId;

}

export async function startVideoCall(caller, receiver) {

  const callId =
    `${caller.uid}_${receiver.uid}_${Date.now()}`;

  await setDoc(
    doc(db, "calls", callId),
    {
      id: callId,
      type: "video",
      callerUid: caller.uid,
      callerName:
        caller.displayName || caller.email,
      receiverUid: receiver.uid,
      receiverName:
        receiver.displayName || receiver.email,
      status: "ringing",
      createdAt: serverTimestamp()
    }
  );

  return callId;

}

export async function answerCall(callId) {

  await updateDoc(
    doc(db, "calls", callId),
    {
      status: "connected"
    }
  );

}

export async function endCall(callId) {

  await updateDoc(
    doc(db, "calls", callId),
    {
      status: "ended",
      endedAt: serverTimestamp()
    }
  );

}

export function subscribeToCall(
  callId,
  callback
) {

  return onSnapshot(
    doc(db, "calls", callId),
    (snapshot) => {

      if (snapshot.exists()) {

        callback(snapshot.data());

      }

    }
  );

}
