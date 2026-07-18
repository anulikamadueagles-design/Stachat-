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
  closeConnection
} from "../services/WebRTCService";

export default function VoiceCallScreen({ route, navigation }) {

  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {

    async function startCall() {

      try {

        await createPeer();
        await getLocalStream(false);

        setStatus("Connected");

      } catch (e) {

        setStatus("Connection Failed");

      }

    }

    startCall();

    return () => {

      closeConnection();

    };

  }, []);

  function endCall() {

    closeConnection();

    navigation.goBack();

  }

  return (

    <View style={styles.container}>

      <Text style={styles.name}>
        {route?.params?.user?.displayName || "Voice Call"}
      </Text>

      <Text style={styles.status}>
        {status}
      </Text>

      <TouchableOpacity
        style={styles.endButton}
        onPress={endCall}
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

  name:{
    fontSize:28,
    color:"#fff",
    fontWeight:"bold"
  },

  status:{
    fontSize:18,
    color:"#ddd",
    marginTop:10
  },

  endButton:{
    marginTop:60,
    backgroundColor:"#E53935",
    paddingHorizontal:35,
    paddingVertical:15,
    borderRadius:30
  },

  endText:{
    color:"#fff",
    fontSize:18,
    fontWeight:"bold"
  }

});
