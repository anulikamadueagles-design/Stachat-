import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  orderBy,
  onSnapshot,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";
import {
  getMyPrivateKey,
  getPublicKeyForUser,
  encryptText,
} from "./EncryptionService";

// Deterministic chat id for a 1-to-1 conversation: same id no matter
// which of the two users opens it first, so both sides read/write the
// same "privateChats/{chatId}" document.
export function getChatId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

// Real-time subscription to all messages in a 1-to-1 chat, oldest first.
export function subscribeToPrivateMessages(chatId, callback) {
  const q = query(
    collection(db, "privateChats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(messages);
  });
}

// Real-time subscription to the parent chat doc (for typing indicator,
// lastMessage, etc).
export function subscribeToPrivateChat(chatId, callback) {
  return onSnapshot(doc(db, "privateChats", chatId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
}

export async function sendPrivateMessage(
  sender,
  receiver,
  {
    text = "",
    imageUrl = null,
    voiceUrl = null,
    videoUrl = null,
    fileUrl = null,
    fileName = null,
    replyTo = null,
    forwarded = false,
  } = {}
) {
  const hasContent =
    text.trim() || imageUrl || voiceUrl || videoUrl || fileUrl;

  if (!hasContent) return;

  const chatId = getChatId(
    sender.uid,
    receiver.uid
  );

  let preview = text;

  if (imageUrl) preview = "📷 Photo";
  if (voiceUrl) preview = "🎤 Voice message";
  if (videoUrl) preview = "🎥 Video";
  if (fileUrl) preview = "📄 " + (fileName || "Document");

  // End-to-end encrypt the text portion when possible. Both sides
  // need a published public key for this to work — if the recipient
  // hasn't opened the updated app yet, we fall back to sending plain
  // text rather than silently failing to deliver the message at all.
  let outgoingText = text;
  let cipherPayload = null;
  let encrypted = false;

  if (text.trim()) {

    try {

      const [myPrivateKey, recipientPublicKey] = await Promise.all([
        getMyPrivateKey(sender.uid),
        getPublicKeyForUser(receiver.uid),
      ]);

      if (myPrivateKey && recipientPublicKey) {
        cipherPayload = encryptText(text, recipientPublicKey, myPrivateKey);
        outgoingText = "";
        encrypted = true;
      }

    } catch (error) {
      console.log("Encryption unavailable, sending as plain text:", error);
    }

  }

  // The chat-list preview shouldn't leak plaintext of an encrypted
  // message — show a generic label instead.
  const listPreview = encrypted ? "🔒 Message" : preview;

  await setDoc(
    doc(db, "privateChats", chatId),
    {
      members: [
        sender.uid,
        receiver.uid,
      ],
      users: [
        {
          uid: sender.uid,
          displayName:
            sender.displayName || sender.email,
          email: sender.email,
        },
        {
          uid: receiver.uid,
          displayName:
            receiver.displayName || receiver.email,
          email: receiver.email,
        },
      ],
      lastMessage: listPreview,
      lastUpdated: serverTimestamp(),
      typing: false,
      typingUser: "",
    },
    { merge: true }
  );

  await addDoc(
    collection(
      db,
      "privateChats",
      chatId,
      "messages"
    ),
    {
      text: outgoingText,
      encrypted,
      cipherText: cipherPayload?.cipherText || null,
      nonce: cipherPayload?.nonce || null,
      imageUrl,
      voiceUrl,
      videoUrl,
      fileUrl,
      fileName,

      senderUid: sender.uid,
      receiverUid: receiver.uid,

      replyTo,

      forwarded,

      edited: false,

      deleted: false,

status: "sent",
sentAt: serverTimestamp(),
deliveredAt: null,
readAt: null,     
reactions: {},

      createdAt: serverTimestamp(),
    }
  );
}
export async function replyToMessage(
  sender,
  receiver,
  message,
  text
) {
  return sendPrivateMessage(
    sender,
    receiver,
    {
      text,
      replyTo: {
        id: message.id,
        text: message.text,
        senderUid: message.senderUid,
      },
    }
  );
}

export async function forwardMessage(
  sender,
  receiver,
  message
) {
  return sendPrivateMessage(
    sender,
    receiver,
    {
      text: message.text || "",
      imageUrl: message.imageUrl || null,
      voiceUrl: message.voiceUrl || null,
      videoUrl: message.videoUrl || null,
      fileUrl: message.fileUrl || null,
      fileName: message.fileName || null,
      forwarded: true,
    }
  );
}
export async function markMessageDelivered(chatId, messageId) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      status: "delivered",
      deliveredAt: serverTimestamp(),
    }
  );
}

export async function markMessageRead(chatId, messageId) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      status: "read",
      readAt: serverTimestamp(),
    }
  );
}
export async function reactToMessage(chatId, messageId, uid, emoji) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      [`reactions.${uid}`]: emoji,
    }
  );
}
export async function deleteForMe(chatId, messageId) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      deleted: true,
    }
  );
}

export async function deleteForEveryone(
  chatId,
  messageId,
  senderUid
) {
  const messageRef = doc(
    db,
    "privateChats",
    chatId,
    "messages",
    messageId
  );

  await updateDoc(messageRef, {
    text: "",
    imageUrl: null,
    voiceUrl: null,
    deleted: true,
    deletedForEveryone: true,
    deletedBy: senderUid,
    deletedAt: serverTimestamp(),
    status: "deleted",
  });
}

export async function editMessage(
  chatId,
  messageId,
  newText
) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      text: newText,
      edited: true,
      editedAt: serverTimestamp(),
    }
  );
}
export async function updateTyping(chatId, uid, isTyping) {
  await updateDoc(
    doc(db, "privateChats", chatId),
    {
      typing: isTyping,
      typingUser: isTyping ? uid : "",
      typingUpdatedAt: serverTimestamp(),
    }
  );
}

export async function markAllMessagesRead(chatId) {
  const snapshot = await getDocs(
    collection(db, "privateChats", chatId, "messages")
  );

  for (const message of snapshot.docs) {
    await updateDoc(message.ref, {
      status: "read",
      readAt: serverTimestamp(),
    });
  }
}

export async function markAllMessagesDelivered(chatId) {
  const snapshot = await getDocs(
    collection(db, "privateChats", chatId, "messages")
  );

  for (const message of snapshot.docs) {
    await updateDoc(message.ref, {
      status: "delivered",
      deliveredAt: serverTimestamp(),
    });
  }
}
export async function updateUnreadCount(chatId, receiverUid) {
  const chatRef = doc(db, "privateChats", chatId);

  await updateDoc(chatRef, {
    [`unread.${receiverUid}`]: increment(1),
    lastUpdated: serverTimestamp(),
  });
}

export async function clearUnreadCount(chatId, uid) {
  const chatRef = doc(db, "privateChats", chatId);

  await updateDoc(chatRef, {
    [`unread.${uid}`]: 0,
  });
}

export async function pinChat(chatId, uid) {
  await updateDoc(
    doc(db, "privateChats", chatId),
    {
      [`pinned.${uid}`]: true,
    }
  );
}

export async function unpinChat(chatId, uid) {
  await updateDoc(
    doc(db, "privateChats", chatId),
    {
      [`pinned.${uid}`]: false,
    }
  );
}

export async function archiveChat(chatId, uid) {
  await updateDoc(
    doc(db, "privateChats", chatId),
    {
      [`archived.${uid}`]: true,
    }
  );
}

export async function unarchiveChat(chatId, uid) {
  await updateDoc(
    doc(db, "privateChats", chatId),
    {
      [`archived.${uid}`]: false,
    }
  );
}
export async function starMessage(chatId, messageId, uid) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      [`starred.${uid}`]: true,
    }
  );
}

export async function unstarMessage(chatId, messageId, uid) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      [`starred.${uid}`]: false,
    }
  );
}

export async function muteChat(chatId, uid) {
  await updateDoc(
    doc(db, "privateChats", chatId),
    {
      [`muted.${uid}`]: true,
    }
  );
}

export async function unmuteChat(chatId, uid) {
  await updateDoc(
    doc(db, "privateChats", chatId),
    {
      [`muted.${uid}`]: false,
    }
  );
}

export async function blockUser(uid, blockedUid) {
  await updateDoc(
    doc(db, "users", uid),
    {
      [`blocked.${blockedUid}`]: true,
    }
  );
}

export async function unblockUser(uid, blockedUid) {
  await updateDoc(
    doc(db, "users", uid),
    {
      [`blocked.${blockedUid}`]: false,
    }
  );
}
// ===============================
// ADVANCED CHAT FEATURES
// ===============================

export async function searchMessages(chatId, keyword) {
  const snapshot = await getDocs(
    collection(db, "privateChats", chatId, "messages")
  );

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(msg =>
      (msg.text || "")
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );
}

export async function getStarredMessages(chatId, uid) {
  const snapshot = await getDocs(
    collection(db, "privateChats", chatId, "messages")
  );

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(msg => msg.starred?.[uid]);
}

export async function clearChat(chatId) {
  const snapshot = await getDocs(
    collection(db, "privateChats", chatId, "messages")
  );

  for (const message of snapshot.docs) {
    await deleteDoc(message.ref);
  }
}

export async function sendSystemMessage(chatId, text) {
  await addDoc(
    collection(db, "privateChats", chatId, "messages"),
    {
      system: true,
      text,
      createdAt: serverTimestamp(),
      status: "sent",
    }
  );
}

export async function sendLocation(
  sender,
  receiver,
  latitude,
  longitude
) {
  return sendPrivateMessage(sender, receiver, {
    text: "",
    location: {
      latitude,
      longitude,
    },
  });
}

export async function sendContact(
  sender,
  receiver,
  contact
) {
  return sendPrivateMessage(sender, receiver, {
    text: "",
    contact,
  });
}

export async function sendSticker(
  sender,
  receiver,
  sticker
) {
  return sendPrivateMessage(sender, receiver, {
    text: "",
    sticker,
  });
}

export async function sendGif(
  sender,
  receiver,
  gifUrl
) {
  return sendPrivateMessage(sender, receiver, {
    text: "",
    gifUrl,
  });
}

export async function sendDocument(
  sender,
  receiver,
  fileUrl,
  fileName
) {
  return sendPrivateMessage(sender, receiver, {
    text: "",
    fileUrl,
    fileName,
  });
}

export async function revokeMessage(chatId, messageId) {
  await updateDoc(
    doc(
      db,
      "privateChats",
      chatId,
      "messages",
      messageId
    ),
    {
      revoked: true,
      revokedAt: serverTimestamp(),
      text: "This message was deleted.",
    }
  );
}
