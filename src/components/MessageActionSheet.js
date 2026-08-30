import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function MessageActionSheet({
  visible,
  message,
  onClose,
  onReact,
  onReply,
  onForward,
  onDeleteForMe,
  onDeleteForEveryone,
}) {
  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          <View style={styles.reactionRow}>
            {QUICK_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionButton}
                onPress={() => onReact(emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.action} onPress={onReply}>
            <Text style={styles.actionText}>↩️ Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={onForward}>
            <Text style={styles.actionText}>➡️ Forward</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={onDeleteForMe}>
            <Text style={styles.actionText}>🗑️ Delete for me</Text>
          </TouchableOpacity>

          {message.mine && !message.deletedForEveryone ? (
            <TouchableOpacity
              style={styles.action}
              onPress={onDeleteForEveryone}
            >
              <Text style={[styles.actionText, styles.dangerText]}>
                🚫 Delete for everyone
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#12181C",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  reactionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  reactionButton: {
    padding: 6,
  },
  reactionEmoji: {
    fontSize: 26,
  },
  action: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 16,
    color: "#E6F7F3",
  },
  dangerText: {
    color: "#D32F2F",
  },
});
