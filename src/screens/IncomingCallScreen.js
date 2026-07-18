import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

export default function IncomingCallScreen({
  route,
  navigation
}) {

  const { call } = route.params;

  function answer() {

    if (call.type === "video") {

      navigation.replace(
        "VideoCall",
        { user: { displayName: call.callerName } }
      );

    } else {

      navigation.replace(
        "VoiceCall",
        { user: { displayName: call.callerName } }
      );

    }

  }

  function reject() {

    navigation.goBack();

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Incoming {call.type} Call
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
    backgroundColor:"#075E54"
  },

  title:{
    color:"#fff",
    fontSize:28,
    fontWeight:"bold"
  },

  name:{
    color:"#fff",
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
    color:"#fff",
    fontWeight:"bold",
    fontSize:18
  }

});
