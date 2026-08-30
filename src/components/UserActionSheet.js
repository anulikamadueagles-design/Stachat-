import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

const REPORT_REASONS = [
  "Spam",
  "Harassment or abuse",
  "Inappropriate content",
  "Impersonation",
  "Other",
];

export default function UserActionSheet({
  visible,
  isBlocked,
  onClose,
  onBlock,
  onUnblock,
  onReport,
}) {
  const [reportMode, setReportMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [details, setDetails] = useState("");

  function close() {
    setReportMode(false);
    setSelectedReason(null);
    setDetails("");
    onClose();
  }

  function confirmBlock() {
    Alert.alert(
      isBlocked ? "Unblock this user?" : "Block this user?",
      isBlocked
        ? "You'll start seeing their messages again."
        : "They won't be able to send you messages anymore.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isBlocked ? "Unblock" : "Block",
          style: isBlocked ? "default" : "destructive",
          onPress: () => {
            isBlocked ? onUnblock() : onBlock();
            close();
          },
        },
      ]
    );
  }

  function submitReport() {
    if (!selectedReason) return;
    onReport(selectedReason, details);
    close();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close}>
        <View style={styles.sheet}>

          {!reportMode ? (
            <>
              <TouchableOpacity style={styles.action} onPress={confirmBlock}>
                <Text style={styles.actionText}>
                  {isBlocked ? "🔓 Unblock user" : "🚫 Block user"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.action}
                onPress={() => setReportMode(true)}
              >
                <Text style={[styles.actionText, styles.dangerText]}>
                  🚩 Report user
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sheetTitle}>Why are you reporting this user?</Text>

              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonRow}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedReason === reason && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}

              <TextInput
        placeholderTextColor="#9BA3AE"
                style={styles.detailsInput}
                placeholder="Additional details (optional)"
                value={details}
                onChangeText={setDetails}
                multiline
              />

              <TouchableOpacity
                style={[styles.submitButton, !selectedReason && styles.submitDisabled]}
                onPress={submitReport}
                disabled={!selectedReason}
              >
                <Text style={styles.submitText}>Submit Report</Text>
              </TouchableOpacity>
            </>
          )}

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
    paddingHorizontal: 20,
  },
  action: {
    paddingVertical: 14,
  },
  actionText: {
    fontSize: 16,
    color: "#E6F7F3",
  },
  dangerText: {
    color: "#D32F2F",
  },
  sheetTitle: {
    color: "#E6F7F3",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 6,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#00BFA5",
    marginRight: 12,
  },
  radioSelected: {
    backgroundColor: "#0D1117",
  },
  reasonText: {
    color: "#E6F7F3",
    fontSize: 15,
  },
  detailsInput: {
    color: "#E6F7F3",
    backgroundColor: "#1C2128",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#D32F2F",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#E6F7F3",
    fontWeight: "bold",
  },
});
