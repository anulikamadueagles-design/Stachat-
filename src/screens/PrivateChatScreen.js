import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

export default function PrivateChatScreen({
  navigation,
  route
}) {

  const { user } = route.params;

  return (

    <View style={styles.container}>

      <ChatHeader user={user} />

      <MessageList user={user} />

      <MessageInput user={user} />

      <TouchableOpacity
        style={styles.voice}
        onPress={() =>
          navigation.navigate(
            "VoiceCall",
            { user }
          )
        }
      />

      <TouchableOpacity
        style={styles.video}
        onPress={() =>
          navigation.navigate(
            "VideoCall",
            { user }
          )
        }
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#ECE5DD"
  },

  voice:{
    position:"absolute",
    top:15,
    right:70,
    width:40,
    height:40
  },

  video:{
    position:"absolute",
    top:15,
    right:15,
    width:40,
    height:40
  }

});
