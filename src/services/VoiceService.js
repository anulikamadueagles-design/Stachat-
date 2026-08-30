import { Audio } from "expo-av";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";

let recording = null;
let sound = null;

export async function startRecording() {
  const permission = await Audio.requestPermissionsAsync();

  if (!permission.granted) {
    alert("Microphone permission denied.");
    return;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  recording = new Audio.Recording();

  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  await recording.startAsync();
}

export async function stopRecording(uid) {
  if (!recording) return null;

  await recording.stopAndUnloadAsync();

  const uri = recording.getURI();

  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(
    storage,
    `voiceNotes/${uid}/${Date.now()}.m4a`
  );

  await uploadBytes(storageRef, blob);

  const url = await getDownloadURL(storageRef);

  recording = null;

  return {
    url,
    storagePath: storageRef.fullPath,
    duration: 0,
  };
}

export async function playVoice(url) {
  if (sound) {
    await sound.unloadAsync();
  }

  const result = await Audio.Sound.createAsync({
    uri: url,
  });

  sound = result.sound;

  await sound.playAsync();
}

export async function pauseVoice() {
  if (sound) {
    await sound.pauseAsync();
  }
}

export async function resumeVoice() {
  if (sound) {
    await sound.playAsync();
  }
}

export async function stopVoice() {
  if (sound) {
    await sound.stopAsync();
    await sound.unloadAsync();
    sound = null;
  }
}

export async function deleteVoice(storagePath) {
  if (!storagePath) return;

  const voiceRef = ref(storage, storagePath);

  await deleteObject(voiceRef);
}
