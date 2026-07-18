import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { Audio } from "expo-av";

export default function MessageBubble({ message }) {

  async function playVoice() {

    if (!message.voiceUrl) return;

    const { sound } =
      await Audio.Sound.createAsync({
        uri: message.voiceUrl
      });

    await sound.playAsync();

  }

  function formatTime() {

    if (!message.createdAt?.seconds)
      return "";

    const date = new Date(
      message.createdAt.seconds * 1000
    );

    return date.toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
    });

  }

  return (

    <View
      style={[
        styles.container,
        message.mine
          ? styles.mine
          : styles.other
      ]}
    >

      {message.text ? (

        <Text style={styles.text}>
          {message.text}
        </Text>

      ) : null}

      {message.imageUrl ? (

        <Image
          source={{
            uri:message.imageUrl
          }}
          style={styles.image}
        />

      ) : null}

      {message.voiceUrl ? (

        <TouchableOpacity
          onPress={playVoice}
        >

          <Text style={styles.voice}>
            ▶️ Play Voice
          </Text>

        </TouchableOpacity>

      ) : null}

      <View style={styles.footer}>

        <Text style={styles.time}>
          {formatTime()}
        </Text>

        <Text style={styles.tick}>
          {message.status==="read"
            ? "✓✓"
            : message.status==="delivered"
            ? "✓✓"
            : "✓"}
        </Text>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    maxWidth:"80%",
    margin:8,
    padding:10,
    borderRadius:12
  },

  mine:{
    alignSelf:"flex-end",
    backgroundColor:"#DCF8C6"
  },

  other:{
    alignSelf:"flex-start",
    backgroundColor:"#FFFFFF"
  },

  text:{
    fontSize:16
  },

  image:{
    width:220,
    height:220,
    borderRadius:10,
    marginTop:6
  },

  voice:{
    color:"#075E54",
    fontWeight:"bold",
    marginTop:5
  },

  footer:{
    flexDirection:"row",
    justifyContent:"flex-end",
    marginTop:5
  },

  time:{
    fontSize:11,
    color:"#666"
  },

  tick:{
    marginLeft:5,
    color:"#34B7F1",
    fontSize:12
  }

});
