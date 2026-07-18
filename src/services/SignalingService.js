import {
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion
} from "firebase/firestore";

import { db } from "../config/firebase";

export async function sendOffer(callId, offer) {

  await updateDoc(
    doc(db, "calls", callId),
    {
      offer
    }
  );

}

export async function sendAnswer(callId, answer) {

  await updateDoc(
    doc(db, "calls", callId),
    {
      answer
    }
  );

}

export async function sendIceCandidate(
  callId,
  candidate,
  type
) {

  await updateDoc(
    doc(db, "calls", callId),
    {
      [type]: arrayUnion(candidate)
    }
  );

}

export function subscribeCall(
  callId,
  callback
) {

  return onSnapshot(
    doc(db, "calls", callId),
    snapshot => {

      if (snapshot.exists()) {

        callback(snapshot.data());

      }

    }
  );

}
