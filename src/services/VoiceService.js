import { Audio } from "expo-av";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { storage } from "../config/firebase";

let recording = null;
let sound = null;

export async function startRecording() {

  const permission =
    await Audio.requestPermissionsAsync();

  if (!permission.granted) {

    alert("Microphone permission denied.");

    return;

  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true
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

  recording = null;

  const response = await fetch(uri);

  const blob = await response.blob();

  const audioRef = ref(
    storage,
    `voiceNotes/${uid}/${Date.now()}.m4a`
  );

  await uploadBytes(audioRef, blob);

  return await getDownloadURL(audioRef);

}

export async function playVoice(url) {

  if (sound) {

    await sound.unloadAsync();

  }

  const result =
    await Audio.Sound.createAsync({
      uri: url
    });

  sound = result.sound;

  await sound.playAsync();

}
