import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
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

  async function openFile() {

    if (!message.fileUrl) return;

    await Linking.openURL(
      message.fileUrl
    );

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

  function fileIcon() {

    if (!message.fileName)
      return "📄";

    const name =
      message.fileName.toLowerCase();

    if (name.endsWith(".pdf"))
      return "📕";

    if (
      name.endsWith(".doc") ||
      name.endsWith(".docx")
    )
      return "📘";

    if (
      name.endsWith(".xls") ||
      name.endsWith(".xlsx")
    )
      return "📗";

    if (
      name.endsWith(".zip") ||
      name.endsWith(".rar")
    )
      return "🗜️";

    return "📄";

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
            uri: message.imageUrl
          }}
          style={styles.image}
        />

      ) : null}

      {message.voiceUrl ? (

        <TouchableOpacity
          onPress={playVoice}
        >

          <Text style={styles.voice}>
            ▶️ Play Voice Message
          </Text>

        </TouchableOpacity>

      ) : null}

      {message.fileUrl ? (

        <TouchableOpacity
          style={styles.fileBox}
          onPress={openFile}
        >

          <Text style={styles.fileIcon}>
            {fileIcon()}
          </Text>

          <View style={{flex:1}}>

            <Text
              numberOfLines={1}
              style={styles.fileName}
            >
              {message.fileName}
            </Text>

            <Text style={styles.download}>
              Tap to Open / Download
            </Text>

          </View>

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
    marginTop:8
  },

  fileBox:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#F2F2F2",
    padding:10,
    borderRadius:10,
    marginTop:8
  },

  fileIcon:{
    fontSize:30,
    marginRight:10
  },

  fileName:{
    fontWeight:"bold",
    fontSize:15
  },

  download:{
    color:"#075E54",
    marginTop:4
  },

  footer:{
    flexDirection:"row",
    justifyContent:"flex-end",
    marginTop:8
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
