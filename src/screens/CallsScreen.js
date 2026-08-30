import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import {
  collection,
  query,
  where,
  onSnapshot,
  limit
} from "firebase/firestore";

import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";

export default function CallsScreen({ navigation }) {

  const { user } = useContext(AuthContext);
  const [calls, setCalls] = useState([]);

  useEffect(() => {

    // Sorted client-side to avoid requiring a manual Firestore composite
    // index for array-contains + orderBy.
    const q = query(
      collection(db, "calls"),
      where("members", "array-contains", user.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, snapshot => {

      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      setCalls(list);

    });

    return unsubscribe;

  }, []);

  function statusLabel(call) {

    if (call.status === "ringing") return "Missed";
    if (call.status === "declined") return "Declined";
    if (call.status === "answered" || call.status === "ended") {
      return call.callerId === user.uid ? "Outgoing" : "Incoming";
    }
    return call.status || "";

  }

  function formatTime(call) {

    if (!call.createdAt?.seconds) return "";

    const date = new Date(call.createdAt.seconds * 1000);

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  }

  function callBack(call) {

    const otherUid =
      call.callerId === user.uid ? call.receiverId : call.callerId;

    const otherName =
      call.callerId === user.uid ? call.receiverName : call.callerName;

    const target = { uid: otherUid, displayName: otherName };

    navigation.navigate(
      call.type === "video" ? "VideoCall" : "VoiceCall",
      { user: target }
    );

  }

  function renderItem({ item }) {

    const otherName =
      item.callerId === user.uid ? item.receiverName : item.callerName;

    return (

      <TouchableOpacity
        style={styles.card}
        onPress={() => callBack(item)}
      >

        <View>

          <Text style={styles.name}>
            {otherName}
          </Text>

          <Text style={styles.info}>
            {item.type === "video" ? "🎥" : "📞"} {statusLabel(item)}
          </Text>

        </View>

        <Text style={styles.time}>
          {formatTime(item)}
        </Text>

      </TouchableOpacity>

    );

  }

  return (

    <View style={styles.container}>

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={calls}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No calls yet</Text>
          </View>
        }
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  card:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"#12181C",
    margin:10,
    padding:15,
    borderRadius:10
  },

  name:{
    color: "#E6F7F3",
    fontWeight:"bold",
    fontSize:16
  },

  info:{
    color:"#9BA3AE",
    marginTop:4
  },

  time:{
    color:"#9BA3AE",
    fontSize:12
  },

  empty:{
    alignItems:"center",
    marginTop:60
  },

  emptyText:{
    fontSize:16,
    color:"#9BA3AE"
  }

});
