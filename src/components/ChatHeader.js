import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { subscribeToUserStatus } from "../status/OnlineStatus";
import { AuthContext } from "../context/AuthContext";
import {
  subscribeToBlockedUsers,
  blockUser,
  unblockUser,
  reportUser,
} from "../services/BlockService";
import UserActionSheet from "./UserActionSheet";

function formatLastSeen(lastSeen) {
  if (!lastSeen?.seconds) return "";

  const date = new Date(lastSeen.seconds * 1000);

  return "last seen " + date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function ChatHeader({ user }) {

  const navigation = useNavigation();
  const { user: currentUser } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {

    if (!user?.uid) return;

    const unsubscribe = subscribeToUserStatus(
      user.uid,
      setStatus
    );

    return unsubscribe;

  }, [user?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToBlockedUsers(currentUser.uid, setBlockedUsers);
  }, [currentUser?.uid]);

  const isBlocked = blockedUsers.includes(user?.uid);

  const statusText = status?.online
    ? "Online"
    : status?.lastSeen
      ? formatLastSeen(status.lastSeen)
      : "";

  return (

    <View style={styles.header}>

      <View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {user?.displayName || "Unknown User"}
          </Text>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        <Text style={styles.status}>
          {isBlocked ? "Blocked" : statusText}
        </Text>

      </View>

      <View style={styles.actions}>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "VoiceCall",
              { user }
            )
          }
        >
          <Text style={styles.icon}>
            📞
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "VideoCall",
              { user }
            )
          }
        >
          <Text style={styles.icon}>
            📹
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Text style={styles.icon}>
            ⋮
          </Text>
        </TouchableOpacity>

      </View>

      <UserActionSheet
        visible={menuVisible}
        isBlocked={isBlocked}
        onClose={() => setMenuVisible(false)}
        onBlock={() => blockUser(currentUser.uid, user.uid).catch(() => {})}
        onUnblock={() => unblockUser(currentUser.uid, user.uid).catch(() => {})}
        onReport={(reason, details) =>
          reportUser(currentUser.uid, user.uid, reason, { details }).catch(() => {})
        }
      />

    </View>

  );

}

const styles = StyleSheet.create({

  header:{
    backgroundColor:"#0D1117",
    padding:15,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },

  nameRow:{
    flexDirection:"row",
    alignItems:"center"
  },

  name:{
    color:"#E6F7F3",
    fontSize:18,
    fontWeight:"bold"
  },

  lockIcon:{
    fontSize:12,
    marginLeft:6
  },

  status:{
    color:"#9BA3AE",
    fontSize:12
  },

  actions:{
    flexDirection:"row"
  },

  icon:{
    color:"#E6F7F3",
    fontSize:24,
    marginLeft:20
  }

});
