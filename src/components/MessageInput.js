import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { AuthContext } from "../context/AuthContext";
import {
  getChatId,
  sendPrivateMessage,
  replyToMessage,
  updateTyping,
} from "../services/ChatService";

import {
  pickImage,
  pickVideo,
  takePhoto,
  recordVideo,
  uploadImage,
  uploadVideo,
} from "../services/MediaService";

import { pickDocument, uploadDocument } from "../services/FileService";
import { startRecording, stopRecording } from "../services/VoiceService";
import { subscribeToBlockedUsers, unblockUser } from "../services/BlockService";

const TYPING_TIMEOUT_MS = 2000;

export default function MessageInput({ user, replyingTo, onCancelReply, onSent }) {
  const { user: currentUser } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToBlockedUsers(currentUser.uid, setBlockedUsers);
  }, [currentUser?.uid]);

  const iBlockedThem = blockedUsers.includes(user?.uid);

  const chatId =
    currentUser && user
      ? getChatId(currentUser.uid, user.uid)
      : null;

  function handleChangeText(text) {
    setMessage(text);

    if (!chatId) return;

    // Tell the other user we're typing, then clear it after a pause.
    updateTyping(chatId, currentUser.uid, true).catch(() => {});

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateTyping(chatId, currentUser.uid, false).catch(() => {});
    }, TYPING_TIMEOUT_MS);
  }

  async function deliver(payload) {
    // Replies carry only text in this app's data model, so a reply with
    // an attachment falls back to a normal message with the same
    // replyTo reference attached.
    if (replyingTo) {
      await sendPrivateMessage(currentUser, user, {
        ...payload,
        replyTo: {
          id: replyingTo.id,
          text: replyingTo.text,
          senderUid: replyingTo.senderUid,
        },
      });
    } else {
      await sendPrivateMessage(currentUser, user, payload);
    }

    onSent?.();
  }

  async function handleSend() {
    const text = message.trim();

    if (!text || !chatId || sending) return;

    setSending(true);
    setMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      await updateTyping(chatId, currentUser.uid, false);

      if (replyingTo) {
        await replyToMessage(currentUser, user, replyingTo, text);
        onSent?.();
      } else {
        await deliver({ text });
      }
    } catch (error) {
      console.log("Failed to send message:", error);

      if (error.code === "permission-denied") {
        Alert.alert(
          "Message not delivered",
          "This message couldn't be sent. The recipient may have blocked you."
        );
        setMessage(text);
      }
    } finally {
      setSending(false);
    }
  }

  async function withAttachmentUpload(action) {
    setAttachmentsOpen(false);
    setUploading(true);

    try {
      await action();
    } catch (error) {
      console.log("Attachment failed:", error);
      alert("Couldn't send that attachment. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePickImage() {
    await withAttachmentUpload(async () => {
      const asset = await pickImage();
      if (!asset) return;
      const url = await uploadImage(asset, currentUser.uid);
      if (url) await deliver({ imageUrl: url });
    });
  }

  async function handleTakePhoto() {
    await withAttachmentUpload(async () => {
      const asset = await takePhoto();
      if (!asset) return;
      const url = await uploadImage(asset, currentUser.uid);
      if (url) await deliver({ imageUrl: url });
    });
  }

  async function handlePickVideo() {
    await withAttachmentUpload(async () => {
      const asset = await pickVideo();
      if (!asset) return;
      const url = await uploadVideo(asset, currentUser.uid);
      if (url) await deliver({ videoUrl: url });
    });
  }

  async function handleRecordVideo() {
    await withAttachmentUpload(async () => {
      const asset = await recordVideo();
      if (!asset) return;
      const url = await uploadVideo(asset, currentUser.uid);
      if (url) await deliver({ videoUrl: url });
    });
  }

  async function handlePickDocument() {
    await withAttachmentUpload(async () => {
      const file = await pickDocument();
      if (!file) return;
      const url = await uploadDocument(file, currentUser.uid);
      if (url) await deliver({ fileUrl: url, fileName: file.name });
    });
  }

  async function handleMicPress() {
    if (isRecording) {
      setIsRecording(false);
      setUploading(true);

      try {
        const result = await stopRecording(currentUser.uid);
        if (result?.url) await deliver({ voiceUrl: result.url });
      } catch (error) {
        console.log("Voice note failed:", error);
        alert("Couldn't send the voice note. Please try again.");
      } finally {
        setUploading(false);
      }
    } else {
      try {
        await startRecording();
        setIsRecording(true);
      } catch (error) {
        console.log("Couldn't start recording:", error);
      }
    }
  }

  const busy = sending || uploading;

  if (iBlockedThem) {
    return (
      <View style={styles.blockedBanner}>
        <Text style={styles.blockedText}>
          You've blocked this user. Unblock to send messages.
        </Text>
        <TouchableOpacity
          style={styles.unblockButton}
          onPress={() => unblockUser(currentUser.uid, user.uid).catch(() => {})}
        >
          <Text style={styles.unblockButtonText}>Unblock</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {replyingTo ? (
        <View style={styles.replyPreview}>
          <View style={styles.replyPreviewBar} />
          <Text style={styles.replyPreviewText} numberOfLines={1}>
            {replyingTo.text || "Media message"}
          </Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Text style={styles.replyPreviewCancel}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {attachmentsOpen ? (
        <View style={styles.attachmentRow}>
          <TouchableOpacity style={styles.attachmentItem} onPress={handlePickImage}>
            <Text style={styles.attachmentIcon}>🖼️</Text>
            <Text style={styles.attachmentLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentItem} onPress={handleTakePhoto}>
            <Text style={styles.attachmentIcon}>📸</Text>
            <Text style={styles.attachmentLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentItem} onPress={handlePickVideo}>
            <Text style={styles.attachmentIcon}>🎞️</Text>
            <Text style={styles.attachmentLabel}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentItem} onPress={handleRecordVideo}>
            <Text style={styles.attachmentIcon}>🎥</Text>
            <Text style={styles.attachmentLabel}>Record</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentItem} onPress={handlePickDocument}>
            <Text style={styles.attachmentIcon}>📄</Text>
            <Text style={styles.attachmentLabel}>Document</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => setAttachmentsOpen((open) => !open)}
        >
          <Text style={styles.plusText}>{attachmentsOpen ? "✕" : "+"}</Text>
        </TouchableOpacity>

        <TextInput
        placeholderTextColor="#9BA3AE"
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={handleChangeText}
          multiline
        />

        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={handleMicPress}
        >
          <Text style={styles.micText}>{isRecording ? "⏹️" : "🎤"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={busy}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.send}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#12181C",
    padding: 15,
  },

  blockedText: {
    flex: 1,
    color: "#9BA3AE",
    fontSize: 13,
    marginRight: 10,
  },

  unblockButton: {
    backgroundColor: "#00BFA5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  unblockButtonText: {
    color: "#E6F7F3",
    fontWeight: "bold",
    fontSize: 13,
  },
  container: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#12181C",
    alignItems: "center",
  },
  input: {
    color: "#E6F7F3",
    flex: 1,
    borderWidth: 1,
    borderColor: "#21262D",
    borderRadius: 20,
    paddingHorizontal: 15,
    minHeight: 45,
    maxHeight: 120,
    marginHorizontal: 8,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1C2128",
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    fontSize: 20,
    color: "#00BFA5",
    fontWeight: "bold",
  },
  micButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonActive: {
    backgroundColor: "#3A1E1E",
    borderRadius: 18,
  },
  micText: {
    fontSize: 20,
  },
  button: {
    marginLeft: 6,
    backgroundColor: "#00E676",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  send: {
    color: "#E6F7F3",
    fontWeight: "bold",
  },
  attachmentRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#12181C",
    borderTopWidth: 1,
    borderTopColor: "#21262D",
  },
  attachmentItem: {
    alignItems: "center",
  },
  attachmentIcon: {
    fontSize: 26,
  },
  attachmentLabel: {
    fontSize: 11,
    color: "#9BA3AE",
    marginTop: 4,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C2128",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyPreviewBar: {
    width: 3,
    height: "100%",
    backgroundColor: "#0D1117",
    marginRight: 8,
    borderRadius: 2,
  },
  replyPreviewText: {
    flex: 1,
    color: "#9BA3AE",
    fontSize: 13,
  },
  replyPreviewCancel: {
    fontSize: 16,
    color: "#9BA3AE",
    paddingHorizontal: 8,
  },
});
