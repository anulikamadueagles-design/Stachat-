import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { Audio, Video, ResizeMode } from "expo-av";
import { downloadFile } from "../services/DownloadService";

function MessageBubble({ message, onLongPress }) {

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

    await downloadFile(
      message.fileUrl,
      message.fileName
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

    if (name.endsWith(".doc") ||
        name.endsWith(".docx"))
      return "📘";

    if (name.endsWith(".xls") ||
        name.endsWith(".xlsx"))
      return "📗";

    if (name.endsWith(".zip") ||
        name.endsWith(".rar"))
      return "🗜️";

    return "📄";

  }

  // Deleted-for-everyone messages show a placeholder instead of content,
  // for both sides of the conversation.
  if (message.deletedForEveryone) {
    return (
      <View
        style={[
          styles.container,
          message.mine ? styles.mine : styles.other,
        ]}
      >
        <Text style={styles.deletedText}>
          🚫 This message was deleted
        </Text>
      </View>
    );
  }

  const reactionEntries = message.reactions
    ? Object.entries(message.reactions).filter(([, emoji]) => emoji)
    : [];

  return (

    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={() => onLongPress?.(message)}
      style={[
        styles.container,
        message.mine
          ? styles.mine
          : styles.other
      ]}
    >

      {message.forwarded ? (
        <Text style={styles.forwardedLabel}>
          ↪ Forwarded
        </Text>
      ) : null}

      {!message.mine && message.senderName ? (
        <Text style={styles.senderName}>
          {message.senderName}
        </Text>
      ) : null}

      {message.replyTo ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyText} numberOfLines={1}>
            {message.replyTo.text || "Media message"}
          </Text>
        </View>
      ) : null}

      {message.text ? (

        <Text style={styles.text}>
          {message.text}
        </Text>

      ) : null}

      {message.imageUrl ? (

        <Image
          source={{ uri: message.imageUrl }}
          style={styles.image}
        />

      ) : null}

      {message.videoUrl ? (

        <Video
          source={{ uri: message.videoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.COVER}
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
              style={styles.fileName}
              numberOfLines={1}
            >
              {message.fileName}
            </Text>

            <Text style={styles.download}>
              Open / Download
            </Text>

          </View>

        </TouchableOpacity>

      ) : null}

      {reactionEntries.length > 0 ? (
        <View style={styles.reactionsRow}>
          {reactionEntries.map(([uid, emoji]) => (
            <Text key={uid} style={styles.reactionEmoji}>
              {emoji}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>

        <Text style={styles.time}>
          {formatTime()}
        </Text>

        {message.mine ? (
          <Text style={styles.tick}>
            {message.status==="read"
              ? "✓✓"
              : message.status==="delivered"
              ? "✓✓"
              : "✓"}
          </Text>
        ) : null}

      </View>

    </TouchableOpacity>

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
    backgroundColor:"#0B4F46"
  },

  other:{
    alignSelf:"flex-start",
    backgroundColor:"#12181C"
  },

  text:{
    color: "#E6F7F3",
    fontSize:16
  },

  image:{
    width:220,
    height:220,
    borderRadius:10,
    marginTop:6
  },

  video:{
    width:220,
    height:220,
    borderRadius:10,
    marginTop:6,
    backgroundColor:"#000"
  },

  deletedText:{
    fontSize:14,
    color:"#9BA3AE",
    fontStyle:"italic"
  },

  forwardedLabel:{
    fontSize:11,
    color:"#9BA3AE",
    fontStyle:"italic",
    marginBottom:4
  },

  senderName:{
    fontSize:12,
    fontWeight:"bold",
    color:"#00BFA5",
    marginBottom:2
  },

  replyBox:{
    borderLeftWidth:3,
    borderLeftColor:"#00BFA5",
    backgroundColor:"rgba(0,0,0,0.04)",
    padding:6,
    borderRadius:6,
    marginBottom:6
  },

  replyText:{
    fontSize:13,
    color:"#9BA3AE"
  },

  reactionsRow:{
    flexDirection:"row",
    marginTop:6
  },

  reactionEmoji:{
    fontSize:16,
    marginRight:4
  },

  voice:{
    color:"#00BFA5",
    fontWeight:"bold",
    marginTop:8
  },

  fileBox:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#1C2128",
    padding:10,
    borderRadius:10,
    marginTop:8
  },

  fileIcon:{
    fontSize:30,
    marginRight:10
  },

  fileName:{
    color: "#E6F7F3",
    fontWeight:"bold",
    fontSize:15
  },

  download:{
    color:"#00BFA5",
    marginTop:4
  },

  footer:{
    flexDirection:"row",
    justifyContent:"flex-end",
    marginTop:8
  },

  time:{
    fontSize:11,
    color:"#9BA3AE"
  },

  tick:{
    marginLeft:5,
    color:"#00BFA5",
    fontSize:12
  }

});

// Message lists can be long-running and re-render often (new messages,
// typing indicators, read receipts). Memoizing avoids re-rendering
// every bubble in the list each time only one message actually changed.
export default React.memo(MessageBubble);
