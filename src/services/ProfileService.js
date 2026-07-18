import {
  doc,
  updateDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import {
  db,
  storage
} from "../config/firebase";

export async function updateProfile(
  uid,
  data
){

  await updateDoc(
    doc(db,"users",uid),
    data
  );

}

export async function uploadProfilePhoto(
  uid,
  image
){

  const response =
    await fetch(image.uri);

  const blob =
    await response.blob();

  const imageRef = ref(
    storage,
    `profiles/${uid}.jpg`
  );

  await uploadBytes(
    imageRef,
    blob
  );

  return await getDownloadURL(
    imageRef
  );

}
