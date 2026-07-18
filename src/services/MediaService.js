import * as ImagePicker from "expo-image-picker";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { storage } from "../config/firebase";

export async function pickImage() {

  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {

    alert("Gallery permission denied.");

    return null;

  }

  const result =
    await ImagePicker.launchImageLibraryAsync({

      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: true,

      quality: 0.8

    });

  if (result.canceled) {

    return null;

  }

  return result.assets[0];

}

export async function uploadImage(image, uid) {

  if (!image) return null;

  const response =
    await fetch(image.uri);

  const blob =
    await response.blob();

  const imageRef = ref(
    storage,
    `chatImages/${uid}/${Date.now()}.jpg`
  );

  await uploadBytes(
    imageRef,
    blob
  );

  return await getDownloadURL(
    imageRef
  );

}
