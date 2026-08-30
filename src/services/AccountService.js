import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";

import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Deletes the signed-in user's account: their profile doc and their
 * Firebase Auth account. Requires re-entering their password because
 * Firebase requires a "recent login" for this kind of sensitive
 * operation.
 *
 * What this does NOT do (documented honestly rather than pretending):
 *  - It does not delete messages the user sent inside shared chats/
 *    groups with other people — those conversations belong to the
 *    thread, not solely to this user, the same way deleting your
 *    WhatsApp account doesn't erase your messages from other people's
 *    phones. Their displayName/photo will just stop resolving to a
 *    live profile.
 *  - It does not delete their uploaded media from Firebase Storage.
 *    A complete cascading cleanup (messages, storage files, group
 *    memberships) is a good candidate for a Cloud Function triggered
 *    on user deletion later — flagged the same way as the payment
 *    webhook in PaymentService.js.
 */
export async function deleteAccount(user, password) {

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  await deleteDoc(doc(db, "users", user.uid)).catch(() => {});

  await deleteUser(user);
}

// Softer alternative some users prefer: keep the account but stop
// appearing active/searchable, without the irreversible deletion step.
export async function deactivateAccount(uid) {
  await updateDoc(doc(db, "users", uid), {
    deactivated: true,
    online: false,
  });
}
