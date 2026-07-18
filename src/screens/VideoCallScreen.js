import React, { useEffect, useState } from "react";
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
  createOffer,
  setRemoteDescription,
  addIceCandidate,
  onIceCandidate,
  onRemoteStream,
  closeConnection
} from "../services/WebRTCService";

import {
  createCall,
  sendIceCandidate,
  listenCall,
  listenCandidates
} from "../services/SignalingService";

export default function VideoCallScreen({
  navigation,
  route
}) {

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {

    startCall();

    return () => {

      closeConnection();

    };

  }, []);

  async function startCall() {

    await createPeer();

    const stream =
      await getLocalStream(true);

    setLocalStream(stream);

    const offer =
      await createOffer();

    const callId =
      Date.now().toString();

    await createCall(callId, offer);

    onIceCandidate(async candidate => {

      await sendIceCandidate(
        callId,
        candidate
      );

    });

    onRemoteStream(stream => {

      setRemoteStream(stream);

      setStatus("Connected");

    });

    listenCall(callId, async call => {

      if (call.answer) {

        await setRemoteDescription(
          call.answer
        );

      }

    });

    listenCandidates(callId, async candidate => {

      await addIceCandidate(candidate);

    });

  }

  return (

    <View style={styles.container}>

      {remoteStream ? (

        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remote}
        />

      ) : (

        <Text style={styles.wait}>
          {status}
        </Text>

      )}

      {localStream && (

        <RTCView
          streamURL={localStream.toURL()}
          style={styles.local}
        />

      )}

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

  remote:{
    flex:1
  },

  local:{
    position:"absolute",
    width:120,
    height:180,
    right:15,
    top:50
  },

  wait:{
    color:"#fff",
    textAlign:"center",
    marginTop:100,
    fontSize:20
  },

  end:{
    position:"absolute",
    bottom:40,
    alignSelf:"center",
    backgroundColor:"#E53935",
    paddingHorizontal:30,
    paddingVertical:15,
    borderRadius:30
  },

  endText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:18
  }

});
