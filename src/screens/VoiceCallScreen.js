import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

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

export default function VoiceCallScreen({
  navigation,
  route
}) {

  const { user: currentUser } = useContext(AuthContext);
  const { user, incomingCall } = route.params || {};

  const [status, setStatus] = useState(
    incomingCall ? "Connecting..." : "Calling..."
  );

  const callIdRef = useRef(
    incomingCall?.id || `${Date.now()}_${currentUser.uid}`
  );
  const endedRef = useRef(false);

  useEffect(() => {

    listenForRemote(() => {
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
    await createCallDoc(callIdRef.current, currentUser, user, "voice");
    await startWebRTCCall(callIdRef.current, false);
  }

  async function answerAsReceiver() {
    await markCallAnswered(callIdRef.current);
    await answerIncomingCall(callIdRef.current, false);
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

      <Text style={styles.title}>
        Voice Call
      </Text>

      <Text style={styles.name}>
        {callerLabel}
      </Text>

      <Text style={styles.status}>
        {status}
      </Text>

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
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#0D1117"
  },

  title:{
    color:"#E6F7F3",
    fontSize:20,
    opacity:0.8
  },

  name:{
    color:"#E6F7F3",
    fontSize:28,
    fontWeight:"bold",
    marginTop:10
  },

  status:{
    color:"#E6F7F3",
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
    color:"#E6F7F3",
    fontSize:18,
    fontWeight:"bold"
  }

});
