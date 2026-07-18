import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { RTCView } from "react-native-webrtc";

import {
  createPeer,
  getLocalStream,
  closeConnection
} from "../services/WebRTCService";

export default function VideoCallScreen({
  route,
  navigation
}) {

  const { user } = route.params;

  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [frontCamera, setFrontCamera] = useState(true);
  const [speaker, setSpeaker] = useState(true);
  const [stream, setStream] = useState(null);

  useEffect(() => {

    async function startVideo() {

      try {

        await createPeer();

        const local =
          await getLocalStream(true);

        setStream(local);

      } catch (e) {

        console.log(e);

      }

    }

    startVideo();

    const timer = setInterval(() => {

      setSeconds(s => s + 1);

    }, 1000);

    return () => {

      clearInterval(timer);

      closeConnection();

    };

  }, []);

  function formatTime() {

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  }

  return (

    <View style={styles.container}>

      <View style={styles.video}>

        {stream ? (

          <RTCView
            streamURL={stream.toURL()}
            style={styles.rtcView}
          />

        ) : (

          <Text style={styles.placeholder}>
            Connecting Camera...
          </Text>

        )}

        <Text style={styles.name}>
          {user?.displayName || "Unknown User"}
        </Text>

        <Text style={styles.timer}>
          {formatTime()}
        </Text>

      </View>

      <View style={styles.controls}>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setMuted(!muted)}
        >
          <Text>{muted ? "🔇" : "🎤"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setSpeaker(!speaker)}
        >
          <Text>{speaker ? "🔊" : "🔈"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCameraOn(!cameraOn)}
        >
          <Text>{cameraOn ? "📷" : "🚫📷"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setFrontCamera(!frontCamera)}
        >
          <Text>🔄</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.end}
        onPress={() => {

          closeConnection();

          navigation.goBack();

        }}
      >

        <Text style={styles.endText}>
          End Call
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#000"
  },

  video:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },

  rtcView:{
    position:"absolute",
    width:"100%",
    height:"100%"
  },

  name:{
    color:"#fff",
    fontSize:26,
    fontWeight:"bold"
  },

  timer:{
    color:"#ddd",
    marginTop:8,
    fontSize:18
  },

  placeholder:{
    color:"#fff",
    fontSize:22
  },

  controls:{
    flexDirection:"row",
    justifyContent:"space-evenly",
    padding:20
  },

  button:{
    backgroundColor:"#333",
    padding:18,
    borderRadius:30
  },

  end:{
    backgroundColor:"#E53935",
    margin:20,
    padding:16,
    borderRadius:30,
    alignItems:"center"
  },

  endText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:18
  }

});
