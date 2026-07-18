import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { Audio } from "expo-av";

export default function VoiceRecorder({ onFinish }) {

  const [recording, setRecording] = useState(null);

  async function startRecording() {

    try {

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

      const result =
        await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

      setRecording(result.recording);

    } catch (error) {

      console.log(error);

    }

  }

  async function stopRecording() {

    try {

      if (!recording) return;

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();

      setRecording(null);

      if (onFinish) {

        onFinish(uri);

      }

    } catch (error) {

      console.log(error);

    }

  }

  return (

    <TouchableOpacity
      onPress={
        recording
          ? stopRecording
          : startRecording
      }
    >

      <Text
        style={{
          fontSize:28,
          padding:8
        }}
      >
        {recording ? "⏹️" : "🎤"}
      </Text>

    </TouchableOpacity>

  );

}
