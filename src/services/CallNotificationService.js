import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { db } from "../config/firebase";

// Fires only for newly-created ringing calls addressed to this user,
// not for every call doc that ever matched (which the previous version
// did, since it read the whole snapshot instead of just doc changes).
export function listenIncomingCalls(userId, callback) {

  const q = query(
    collection(db, "calls"),
    where("receiverId", "==", userId),
    where("status", "==", "ringing")
  );

  return onSnapshot(q, snapshot => {

    snapshot.docChanges().forEach(change => {

      if (change.type === "added") {

        callback({
          id: change.doc.id,
          ...change.doc.data()
        });

      }

    });

  });

}
