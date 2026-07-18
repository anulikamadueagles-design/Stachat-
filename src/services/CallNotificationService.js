import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { db } from "./firebase";

export function listenIncomingCalls(userId, callback) {

  const q = query(
    collection(db, "calls"),
    where("receiverId", "==", userId)
  );

  return onSnapshot(q, snapshot => {

    snapshot.forEach(doc => {

      const data = doc.data();

      callback({
        id: doc.id,
        ...data
      });

    });

  });

}
