
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import {
  createPeer,
  getLocalStream,
  createOffer,
  setRemoteDescription,
  onIceCandidate,
  addIceCandidate,
  closeConnection
} from "../services/WebRTCService";

import {
  createCall,
  saveAnswer,
  sendIceCandidate,
  listenCall,
  listenCandidates
} from "../services/SignalingService";

export default function VoiceCallScreen({
  navigation
}) {

  const [status, setStatus] = useState("Calling...");

  useEffect(() => {

    start();

    return () => {

      closeConnection();

    };

  }, []);

  async function start() {

    await createPeer();

    await getLocalStream(false);

    const offer =
      await createOffer();

    const callId =
      Date.now().toString();

    await createCall(
      callId,
      offer
    );

    onIceCandidate(async candidate => {

      await sendIceCandidate(
        callId,
        candidate
      );

    });

    listenCall(callId, async data => {

      if (data.answer) {

        await setRemoteDescription(
          data.answer
        );

        setStatus("Connected");

      }

    });

    listenCandidates(
      callId,
      async candidate => {

        await addIceCandidate(
          candidate
        );

      }
    );

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Voice Call
      </Text>

      <Text style={styles.status}>
        {status}
      </Text>

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
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#075E54"
  },

  title:{
    color:"#fff",
    fontSize:28,
    fontWeight:"bold"
  },

  status:{
    color:"#fff",
    marginTop:15,
    fontSize:18
  },

  end:{
    marginTop:50,
    backgroundColor:"#E53935",
    padding:18,
    borderRadius:30
  },

  endText:{
    color:"#fff",
    fontSize:18,
    fontWeight:"bold"
  }

});
