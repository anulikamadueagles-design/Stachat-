import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import {
  renameGroup,
  removeMember,
  leaveGroup,
  deleteGroup,
} from "../groupchat/GroupService";

import { getUser } from "../services/UserService";

export default function GroupInfoSheet({
  visible,
  group,
  currentUserUid,
  onClose,
  onAddMember,
  onLeft,
}) {
  const [name, setName] = useState(group?.name || "");
  const [memberNames, setMemberNames] = useState({});

  useEffect(() => {
    if (!group?.members) return;

    let cancelled = false;

    Promise.all(
      group.members.map((uid) =>
        getUser(uid).then((u) => [uid, u?.displayName || u?.email || uid])
      )
    ).then((entries) => {
      if (!cancelled) setMemberNames(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [group?.members]);

  if (!group) return null;

  const isOwner = group.owner === currentUserUid;

  async function handleRename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === group.name) return;
    await renameGroup(group.id, trimmed).catch(() => {});
  }

  function confirmRemoveMember(uid) {
    Alert.alert("Remove member?", "They'll no longer see new messages.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMember(group.id, uid).catch(() => {}),
      },
    ]);
  }

  function confirmLeaveOrDelete() {
    if (isOwner) {
      Alert.alert(
        "Delete group?",
        "This deletes the group for everyone. This can't be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteGroup(group.id).catch(() => {});
              onLeft?.();
            },
          },
        ]
      );
    } else {
      Alert.alert("Leave group?", "", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            await leaveGroup(group.id, currentUserUid).catch(() => {});
            onLeft?.();
          },
        },
      ]);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Group Info</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nameRow}>
            <TextInput
        placeholderTextColor="#9BA3AE"
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              editable={isOwner}
              placeholder="Group name"
            />
            {isOwner ? (
              <TouchableOpacity style={styles.saveButton} onPress={handleRename}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.sectionLabel}>
            {group.members?.length || 0} members
          </Text>

          <FlatList
            style={styles.memberList}
            data={group.members || []}
            keyExtractor={(uid) => uid}
            renderItem={({ item: uid }) => (
              <View style={styles.memberRow}>
                <Text style={styles.memberText} numberOfLines={1}>
                  {uid === currentUserUid
                    ? "You"
                    : memberNames[uid] || "..."}
                  {uid === group.owner ? "  👑" : ""}
                </Text>
                {isOwner && uid !== currentUserUid ? (
                  <TouchableOpacity onPress={() => confirmRemoveMember(uid)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          />

          {isOwner ? (
            <TouchableOpacity style={styles.action} onPress={onAddMember}>
              <Text style={styles.actionText}>+ Add Member</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.action} onPress={confirmLeaveOrDelete}>
            <Text style={[styles.actionText, styles.dangerText]}>
              {isOwner ? "🗑️ Delete Group" : "🚪 Leave Group"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 20,
    maxHeight: "75%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    color: "#E6F7F3",
    fontSize: 18,
    fontWeight: "bold",
  },
  close: {
    fontSize: 18,
    color: "#9BA3AE",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  nameInput: {
    color: "#E6F7F3",
    flex: 1,
    borderWidth: 1,
    borderColor: "#21262D",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButton: {
    marginLeft: 10,
    backgroundColor: "#00E676",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveButtonText: {
    color: "#E6F7F3",
    fontWeight: "bold",
  },
  sectionLabel: {
    color: "#9BA3AE",
    fontSize: 12,
    marginBottom: 6,
  },
  memberList: {
    maxHeight: 180,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  memberText: {
    color: "#E6F7F3",
    flex: 1,
    fontSize: 14,
  },
  removeText: {
    color: "#D32F2F",
    fontSize: 13,
  },
  action: {
    paddingVertical: 14,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E6F7F3",
  },
  dangerText: {
    color: "#D32F2F",
  },
});
