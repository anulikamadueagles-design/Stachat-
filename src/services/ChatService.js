import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../config/firebase";

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export async function sendPrivateMessage(
  sender,
  receiver,
  {
    text = "",
    imageUrl = null,
    voiceUrl = null
  } = {}
) {

  const hasContent =
    text.trim() || imageUrl || voiceUrl;

  if (!hasContent) return;

  const chatId = getChatId(
    sender.uid,
    receiver.uid
  );

  let preview = text;

  if (imageUrl) preview = "📷 Photo";

  if (voiceUrl) preview = "🎤 Voice message";

  await setDoc(
    doc(db, "privateChats", chatId),
    {
      members: [
        sender.uid,
        receiver.uid
      ],

      users: [
        {
          uid: sender.uid,
          displayName:
            sender.displayName || sender.email,
          email: sender.email
        },
        {
          uid: receiver.uid,
          displayName:
            receiver.displayName || receiver.email,
          email: receiver.email
        }
      ],

      lastMessage: preview,
      lastUpdated: serverTimestamp(),
      typing: false,
      typingUser: ""

    },
    { merge:true }
  );

  await addDoc(
    collection(
      db,
      "privateChats",
      chatId,
      "messages"
    ),
    {
      text,
      imageUrl,
      voiceUrl,

      senderUid: sender.uid,
      receiverUid: receiver.uid,

      createdAt: serverTimestamp(),

      status:"sent",

      deleted:false

    }
  );

}

export function subscribePrivateMessages(
  uid1,
  uid2,
  callback
){

  const chatId =
    getChatId(uid1,uid2);

  const q=query(

    collection(
      db,
      "privateChats",
      chatId,
      "messages"
    ),

    orderBy(
      "createdAt",
      "asc"
    )

  );

  return onSnapshot(
    q,
    snapshot=>{

      callback(

        snapshot.docs.map(
          doc=>({

            id:doc.id,

            ...doc.data()

          })
        )

      );

    }

  );

}

export async function updateTyping(
  uid1,
  uid2,
  typing,
  name=""
){

  const chatId=
    getChatId(uid1,uid2);

  await updateDoc(

    doc(
      db,
      "privateChats",
      chatId
    ),

    {

      typing,

      typingUser:
        typing ? name : ""

    }

  );

}





