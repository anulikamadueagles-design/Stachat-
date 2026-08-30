import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { RTCView } from "react-native-webrtc";

import { AuthContext } from "../context/AuthContext";

import {
  startCall as startWebRTCCall,
  answerIncomingCall,
  listenForRemote,
  endCurrentCall
} from "../services/CallManager";

import {
  startCall as createCallDoc,
  answerCall as markCallAnswered,
  endCall as markCallEnded,
  listenCall
} from "../services/CallService";

export default function VideoCallScreen({
  navigation,
  route
}) {

  const { user: currentUser } = useContext(AuthContext);
  const { user, incomingCall } = route.params || {};

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState(
    incomingCall ? "Connecting..." : "Calling..."
  );

  const callIdRef = useRef(
    incomingCall?.id || `${Date.now()}_${currentUser.uid}`
  );
  const endedRef = useRef(false);

  useEffect(() => {

    listenForRemote(stream => {
      setRemoteStream(stream);
      setStatus("Connected");
    });

    if (incomingCall) {
      answerAsReceiver();
    } else {
      startAsCaller();
    }

    const unsubscribe = listenCall(callIdRef.current, call => {

      if (call.status === "declined" || call.status === "ended") {
        if (!endedRef.current) {
          endedRef.current = true;
          endCurrentCall();
          navigation.goBack();
        }
      }

    });

    return () => {
      unsubscribe?.();
      endCurrentCall();
    };

  }, []);

  async function startAsCaller() {

    await createCallDoc(callIdRef.current, currentUser, user, "video");

    const stream = await startWebRTCCall(callIdRef.current, true);

    setLocalStream(stream);

  }

  async function answerAsReceiver() {

    await markCallAnswered(callIdRef.current);

    const stream = await answerIncomingCall(callIdRef.current, true);

    setLocalStream(stream);
    setStatus("Connected");

  }

  function handleEndCall() {

    endedRef.current = true;
    markCallEnded(callIdRef.current);
    endCurrentCall();
    navigation.goBack();

  }

  const callerLabel =
    user?.displayName ||
    incomingCall?.callerName ||
    "Unknown";

  return (

    <View style={styles.container}>

      {remoteStream ? (

        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remote}
        />

      ) : (

        <View style={styles.waitContainer}>
          <Text style={styles.name}>{callerLabel}</Text>
          <Text style={styles.wait}>{status}</Text>
        </View>

      )}

      {localStream && (

        <RTCView
          streamURL={localStream.toURL()}
          style={styles.local}
          zOrder={1}
        />

      )}

      <TouchableOpacity
        style={styles.end}
        onPress={handleEndCall}
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
    top:50,
    borderRadius:10
  },

  waitContainer:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },

  name:{
    color:"#E6F7F3",
    fontSize:26,
    fontWeight:"bold"
  },

  wait:{
    color:"#ccc",
    textAlign:"center",
    marginTop:10,
    fontSize:18
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
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:18
  }

});
