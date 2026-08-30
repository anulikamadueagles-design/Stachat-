import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet
} from "react-native";

import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

export default function PrivateChatScreen({
  route
}) {

  const { user } = route.params;
  const [replyingTo, setReplyingTo] = useState(null);

  // Voice/video call buttons already live in ChatHeader and navigate
  // to VoiceCall/VideoCall with this same `user` — no need to duplicate
  // them here.
  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >

      <ChatHeader user={user} />

      <View style={styles.messages}>
        <MessageList user={user} onReply={setReplyingTo} />
      </View>

      <MessageInput
        user={user}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSent={() => setReplyingTo(null)}
      />

    </KeyboardAvoidingView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  messages:{
    flex:1
  }

});
