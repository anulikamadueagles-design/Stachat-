import * as ImagePicker from "expo-image-picker";
// expo-file-system v19+ throws at runtime for methods imported from the
// bare package (e.g. getInfoAsync) — see DownloadService.js for the
// same fix. Import from /legacy to get the working implementations.
import * as FileSystem from "expo-file-system/legacy";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
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
      quality: 0.8,
    });

  if (result.canceled) return null;

  return result.assets[0];
}

export async function pickVideo() {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    alert("Gallery permission denied.");
    return null;
  }

  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

  if (result.canceled) return null;

  return result.assets[0];
}

export async function takePhoto() {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    alert("Camera permission denied.");
    return null;
  }

  const result =
    await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

  if (result.canceled) return null;

  return result.assets[0];
}

export async function recordVideo() {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    alert("Camera permission denied.");
    return null;
  }

  const result =
    await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
      videoMaxDuration: 60,
    });

  if (result.canceled) return null;

  return result.assets[0];
}

export async function uploadImage(image, uid) {
  if (!image) return null;

  const response = await fetch(image.uri);
  const blob = await response.blob();

  const imageRef = ref(
    storage,
    `chatImages/${uid}/${Date.now()}.jpg`
  );

  await uploadBytes(imageRef, blob);

  return await getDownloadURL(imageRef);
}

export async function uploadVideo(video, uid) {
  if (!video) return null;

  const response = await fetch(video.uri);
  const blob = await response.blob();

  const videoRef = ref(
    storage,
    `chatVideos/${uid}/${Date.now()}.mp4`
  );

  await uploadBytes(videoRef, blob);

  return await getDownloadURL(videoRef);
}

export async function uploadFile(file, uid) {
  if (!file) return null;

  const response = await fetch(file.uri);
  const blob = await response.blob();

  const fileRef = ref(
    storage,
    `files/${uid}/${Date.now()}_${file.name || "file"}`
  );

  await uploadBytes(fileRef, blob);

  return {
    url: await getDownloadURL(fileRef),
    name: file.name || "file",
    size: file.size || 0,
  };
}

export async function deleteMedia(storagePath) {
  if (!storagePath) return;

  const mediaRef = ref(storage, storagePath);

  await deleteObject(mediaRef);
}

export async function getFileInfo(uri) {
  return await FileSystem.getInfoAsync(uri);
}
