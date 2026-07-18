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

  function accept() {

    navigation.replace(
      call.type === "video"
        ? "VideoCall"
        : "VoiceCall",
      {
        user: {
          uid: call.callerUid,
          displayName: call.callerName
        },
        callId: call.id
      }
    );

  }

  function decline() {

    navigation.goBack();

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Incoming {call.type} call
      </Text>

      <Text style={styles.name}>
        {call.callerName}
      </Text>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.accept}
          onPress={accept}
        >
          <Text style={styles.text}>
            Accept
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.decline}
          onPress={decline}
        >
          <Text style={styles.text}>
            Decline
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
    fontSize:24,
    marginBottom:10
  },

  name:{
    color:"#fff",
    fontSize:32,
    fontWeight:"bold",
    marginBottom:50
  },

  buttons:{
    flexDirection:"row"
  },

  accept:{
    backgroundColor:"#25D366",
    padding:18,
    borderRadius:30,
    marginHorizontal:20
  },

  decline:{
    backgroundColor:"#E53935",
    padding:18,
    borderRadius:30,
    marginHorizontal:20
  },

  text:{
    color:"#fff",
    fontWeight:"bold"
  }

});
