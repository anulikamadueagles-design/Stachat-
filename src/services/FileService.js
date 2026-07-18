import * as DocumentPicker from "expo-document-picker";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

const storage = getStorage();

export async function pickDocument() {

  const result =
    await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true
    });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];

}

export async function uploadDocument(file, uid) {

  const response =
    await fetch(file.uri);

  const blob =
    await response.blob();

  const fileRef = ref(
    storage,
    `documents/${uid}/${Date.now()}_${file.name}`
  );

  await uploadBytes(fileRef, blob);

  return await getDownloadURL(fileRef);

}
