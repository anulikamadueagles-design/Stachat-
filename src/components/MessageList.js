import React, { useContext, useEffect, useRef, useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { AuthContext } from "../context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageActionSheet from "./MessageActionSheet";

import {
  getChatId,
  subscribeToPrivateMessages,
  subscribeToPrivateChat,
  markAllMessagesRead,
  reactToMessage,
  deleteForMe,
  deleteForEveryone,
} from "../services/ChatService";

import {
  getMyPrivateKey,
  getPublicKeyForUser,
  decryptText,
} from "../services/EncryptionService";

import { subscribeToBlockedUsers } from "../services/BlockService";

export default function MessageList({ user, onReply }) {
  const { user: currentUser } = useContext(AuthContext);
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [chatMeta, setChatMeta] = useState(null);
  const [activeMessage, setActiveMessage] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToBlockedUsers(currentUser.uid, setBlockedUsers);
  }, [currentUser?.uid]);

  const chatId =
    currentUser && user
      ? getChatId(currentUser.uid, user.uid)
      : null;

  useEffect(() => {
    if (!chatId) return;

    let cancelled = false;

    const unsubscribeMessages = subscribeToPrivateMessages(
      chatId,
      async (data) => {

        // Decrypt any encrypted messages before they're rendered. The
        // shared secret is symmetric, so the sender's own private key
        // + the other person's public key decrypts messages either
        // direction — no separate "my sent messages" handling needed.
        const [myPrivateKey, otherPublicKey] = await Promise.all([
          getMyPrivateKey(currentUser.uid),
          getPublicKeyForUser(user.uid),
        ]);

        const decrypted = data.map((message) => {

          if (!message.encrypted) return message;

          if (!myPrivateKey || !otherPublicKey) {
            return { ...message, text: "🔒 Waiting for encryption keys..." };
          }

          const plainText = decryptText(
            message.cipherText,
            message.nonce,
            otherPublicKey,
            myPrivateKey
          );

          return {
            ...message,
            text: plainText ?? "🔒 Unable to decrypt this message",
          };

        });

        if (cancelled) return;

        setMessages(decrypted);

        // Mark incoming messages as read whenever new ones arrive
        // while this screen is open.
        markAllMessagesRead(chatId).catch(() => {});
      }
    );

    const unsubscribeChat = subscribeToPrivateChat(chatId, setChatMeta);

    return () => {
      cancelled = true;
      unsubscribeMessages();
      unsubscribeChat();
    };
  }, [chatId]);

  const isOtherUserTyping =
    chatMeta?.typing && chatMeta?.typingUser === user?.uid;

  const visibleMessages = messages.filter(
    (m) => !blockedUsers.includes(m.senderUid)
  );

  function renderItem({ item }) {
    return (
      <MessageBubble
        message={{
          ...item,
          mine: item.senderUid === currentUser?.uid,
        }}
        onLongPress={setActiveMessage}
      />
    );
  }

  function closeSheet() {
    setActiveMessage(null);
  }

  function handleReact(emoji) {
    if (!chatId || !activeMessage) return;
    reactToMessage(chatId, activeMessage.id, currentUser.uid, emoji).catch(
      () => {}
    );
    closeSheet();
  }

  function handleReply() {
    if (!activeMessage) return;
    onReply?.(activeMessage);
    closeSheet();
  }

  function handleForward() {
    if (!activeMessage) return;
    const message = activeMessage;
    closeSheet();
    navigation.navigate("Contacts", { forwardMessage: message });
  }

  function handleDeleteForMe() {
    if (!chatId || !activeMessage) return;
    deleteForMe(chatId, activeMessage.id).catch(() => {});
    closeSheet();
  }

  function handleDeleteForEveryone() {
    if (!chatId || !activeMessage) return;
    deleteForEveryone(chatId, activeMessage.id, currentUser.uid).catch(
      () => {}
    );
    closeSheet();
  }

  return (
    <View style={styles.container}>
      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        ref={listRef}
        data={visibleMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No messages yet. Say hi 👋
            </Text>
          </View>
        }
        contentContainerStyle={
          messages.length === 0 ? styles.emptyList : null
        }
      />

      {isOtherUserTyping ? (
        <View style={styles.typingRow}>
          <Text style={styles.typingText}>
            {user?.displayName || "User"} is typing...
          </Text>
        </View>
      ) : null}

      <MessageActionSheet
        visible={!!activeMessage}
        message={activeMessage}
        onClose={closeSheet}
        onReact={handleReact}
        onReply={handleReply}
        onForward={handleForward}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9BA3AE",
  },
  typingRow: {
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  typingText: {
    fontSize: 12,
    color: "#00BFA5",
    fontStyle: "italic",
  },
});
