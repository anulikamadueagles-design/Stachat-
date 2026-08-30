import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import { db } from "../config/firebase";

const BACKUP_FORMAT_VERSION = 1;

async function fetchMyPrivateChats(uid) {
  const chatsSnap = await getDocs(
    query(collection(db, "privateChats"), where("members", "array-contains", uid))
  );

  const chats = [];

  for (const chatDoc of chatsSnap.docs) {
    const messagesSnap = await getDocs(
      collection(db, "privateChats", chatDoc.id, "messages")
    );

    chats.push({
      id: chatDoc.id,
      data: chatDoc.data(),
      messages: messagesSnap.docs.map((m) => ({ id: m.id, data: m.data() })),
    });
  }

  return chats;
}

async function fetchMyGroups(uid) {
  const groupsSnap = await getDocs(
    query(collection(db, "groups"), where("members", "array-contains", uid))
  );

  const groups = [];

  for (const groupDoc of groupsSnap.docs) {
    const messagesSnap = await getDocs(
      collection(db, "groups", groupDoc.id, "messages")
    );

    groups.push({
      id: groupDoc.id,
      data: groupDoc.data(),
      messages: messagesSnap.docs.map((m) => ({ id: m.id, data: m.data() })),
    });
  }

  return groups;
}

// Exports everything the user is a member of to a local JSON file and
// opens the native share sheet so they can save it to Drive, Files,
// email it to themselves, etc. Note: media (images/voice/video/files)
// is backed up as *links* to Firebase Storage, not the media bytes
// themselves — if you ever delete the underlying Storage files, those
// links stop working even though the backup JSON still has them.
export async function exportBackup(user, onProgress) {

  onProgress?.("Reading chats...");
  const privateChats = await fetchMyPrivateChats(user.uid);

  onProgress?.("Reading groups...");
  const groups = await fetchMyGroups(user.uid);

  const backup = {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: Date.now(),
    uid: user.uid,
    email: user.email,
    privateChats,
    groups,
  };

  const fileName = `stachat-backup-${Date.now()}.json`;
  const fileUri = FileSystem.documentDirectory + fileName;

  onProgress?.("Writing backup file...");
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup));

  if (await Sharing.isAvailableAsync()) {
    onProgress?.("Opening share sheet...");
    await Sharing.shareAsync(fileUri);
  }

  return {
    fileUri,
    chatCount: privateChats.length,
    groupCount: groups.length,
    messageCount:
      privateChats.reduce((sum, c) => sum + c.messages.length, 0) +
      groups.reduce((sum, g) => sum + g.messages.length, 0),
  };
}

// Lets the user pick a previously-exported backup JSON file and writes
// its contents back into Firestore (merge, so it won't clobber newer
// data — this is meant for recovering something that was deleted, not
// for rolling back).
export async function restoreBackup(onProgress) {

  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
  });

  if (result.canceled) return null;

  const file = result.assets[0];

  onProgress?.("Reading backup file...");
  const raw = await FileSystem.readAsStringAsync(file.uri);
  const backup = JSON.parse(raw);

  if (!backup.privateChats || !backup.groups) {
    throw new Error("This doesn't look like a STAChat backup file.");
  }

  onProgress?.("Restoring chats...");
  for (const chat of backup.privateChats) {
    await setDoc(doc(db, "privateChats", chat.id), chat.data, { merge: true });

    for (const message of chat.messages) {
      await setDoc(
        doc(db, "privateChats", chat.id, "messages", message.id),
        message.data,
        { merge: true }
      );
    }
  }

  onProgress?.("Restoring groups...");
  for (const group of backup.groups) {
    await setDoc(doc(db, "groups", group.id), group.data, { merge: true });

    for (const message of group.messages) {
      await setDoc(
        doc(db, "groups", group.id, "messages", message.id),
        message.data,
        { merge: true }
      );
    }
  }

  return {
    chatCount: backup.privateChats.length,
    groupCount: backup.groups.length,
    exportedAt: backup.exportedAt,
  };
}
