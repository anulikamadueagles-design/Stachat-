import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { declineCall } from "../services/CallService";

export default function IncomingCallScreen({
  route,
  navigation
}) {

  const { call } = route.params;

  function answer() {

    const screen = call.type === "video" ? "VideoCall" : "VoiceCall";

    navigation.replace(screen, { incomingCall: call });

  }

  function reject() {

    declineCall(call.id).catch(() => {});
    navigation.goBack();

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Incoming {call.type === "video" ? "Video" : "Voice"} Call
      </Text>

      <Text style={styles.name}>
        {call.callerName}
      </Text>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.accept}
          onPress={answer}
        >
          <Text style={styles.text}>
            Accept
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reject}
          onPress={reject}
        >
          <Text style={styles.text}>
            Reject
          </Text>
        </TouchableOpacity>

      </View>

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
    fontSize:28,
    fontWeight:"bold"
  },

  name:{
    color:"#E6F7F3",
    fontSize:22,
    marginTop:20
  },

  buttons:{
    flexDirection:"row",
    marginTop:60
  },

  accept:{
    backgroundColor:"green",
    padding:18,
    borderRadius:30,
    marginRight:20
  },

  reject:{
    backgroundColor:"red",
    padding:18,
    borderRadius:30
  },

  text:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:18
  }

});
