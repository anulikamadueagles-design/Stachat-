import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export async function blockUser(myUid, targetUid) {
  await updateDoc(doc(db, "users", myUid), {
    blockedUsers: arrayUnion(targetUid),
  });
}

export async function unblockUser(myUid, targetUid) {
  await updateDoc(doc(db, "users", myUid), {
    blockedUsers: arrayRemove(targetUid),
  });
}

// Live-subscribes to my own blocked list (as opposed to a one-time
// read) so the UI updates immediately if I block/unblock someone.
export function subscribeToBlockedUsers(myUid, callback) {
  return onSnapshot(doc(db, "users", myUid), (snapshot) => {
    callback(snapshot.data()?.blockedUsers || []);
  });
}

// Reports go to a separate "reports" collection for admin review —
// see ReportsScreen.js. reason is a short string, context is optional
// extra detail (e.g. the reported message's text/id).
export async function reportUser(reporterUid, reportedUid, reason, context = {}) {
  await addDoc(collection(db, "reports"), {
    type: "user",
    reporterUid,
    reportedUid,
    reason,
    context,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

export async function reportMessage(reporterUid, reportedUid, messageId, reason, context = {}) {
  await addDoc(collection(db, "reports"), {
    type: "message",
    reporterUid,
    reportedUid,
    messageId,
    reason,
    context,
    status: "open",
    createdAt: serverTimestamp(),
  });
}
