import React, {
  useContext,
  useEffect,
  useState
} from "react";

import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet
} from "react-native";

import { AuthContext } from "../context/AuthContext";

import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";

import {
  sendPrivateMessage,
  subscribePrivateMessages,
  updateTyping
} from "../services/ChatService";

import {
  pickImage,
  uploadImage
} from "../services/MediaService";

import {
  startRecording,
  stopRecording
} from "../services/VoiceService";

export default function PrivateChatScreen({ route }) {

  const { user } = useContext(AuthContext);
  const receiver = route.params.user;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);

  useEffect(() => {

    if (!user || !receiver) return;

    const unsubscribe = subscribePrivateMessages(
      user.uid,
      receiver.uid,
      setMessages
    );

    return unsubscribe;

  }, [user, receiver]);

  async function sendText() {

    if (!text.trim()) return;

    await sendPrivateMessage(
      user,
      receiver,
      { text }
    );

    setText("");

    await updateTyping(
      user.uid,
      receiver.uid,
      false
    );

  }

  async function sendPhoto() {

    const image = await pickImage();

    if (!image) return;

    const imageUrl =
      await uploadImage(image, user.uid);

    await sendPrivateMessage(
      user,
      receiver,
      { imageUrl }
    );

  }

  async function toggleRecording() {

    if (!recording) {

      setRecording(true);

      await startRecording();

    } else {

      const voiceUrl =
        await stopRecording(user.uid);

      setRecording(false);

      if (!voiceUrl) return;

      await sendPrivateMessage(
        user,
        receiver,
        { voiceUrl }
      );

    }

  }

  async function typing(value) {

    setText(value);

    await updateTyping(
      user.uid,
      receiver.uid,
      value.length > 0,
      user.displayName || user.email
    );

  }

  return (

    <View style={styles.container}>

      <ChatHeader user={receiver} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} />
        )}
        contentContainerStyle={{
          paddingVertical:10
        }}
      />

      <View style={styles.bottom}>

        <TouchableOpacity
          style={styles.icon}
          onPress={sendPhoto}
        >
          <Text>📷</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.icon}
          onPress={toggleRecording}
        >
          <Text>
            {recording ? "⏹️" : "🎤"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={text}
          onChangeText={typing}
        />

        <TouchableOpacity
          style={styles.send}
          onPress={sendText}
        >
          <Text style={styles.sendText}>
            Send
          </Text>
        </TouchableOpacity>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#ECE5DD"
  },

  bottom:{
    flexDirection:"row",
    alignItems:"center",
    padding:10,
    backgroundColor:"#fff"
  },

  icon:{
    padding:8
  },

  input:{
    flex:1,
    backgroundColor:"#eee",
    borderRadius:20,
    paddingHorizontal:15,
    height:45
  },

  send:{
    marginLeft:10,
    backgroundColor:"#075E54",
    paddingHorizontal:18,
    paddingVertical:10,
    borderRadius:20
  },

  sendText:{
    color:"#fff",
    fontWeight:"bold"
  }

});
