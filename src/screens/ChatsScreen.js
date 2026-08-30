import React, {
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import { AD_PLACEMENTS, subscribeActiveAds } from "../services/AdService";
import SponsoredChatItem from "../components/SponsoredChatItem";
import BannerAd from "../components/BannerAd";

export default function ChatsScreen({ navigation }) {

  const { user } = useContext(AuthContext);
  const [sponsoredAds, setSponsoredAds] = useState([]);

  useEffect(() => {
    return subscribeActiveAds(AD_PLACEMENTS.CHAT_LIST, setSponsoredAds);
  }, []);

  const [chats, setChats] = useState([]);

  useEffect(() => {

    if (!user) return;

    // array-contains query matches the firestore.rules membership
    // check exactly — a plain unfiltered query here would get rejected
    // once those rules are deployed, and was also downloading every
    // private chat in the whole app just to discard most of them.
    const q = query(
      collection(db, "privateChats"),
      where("members", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        data.sort(
          (a, b) => (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0)
        );

        setChats(data);

      },
      error => {
        console.log(error);
      }
    );

    return unsubscribe;

  }, [user]);

  function openChat(chat) {

    const otherUser =
      chat.users?.find(
        u => u.uid !== user.uid
      ) || {
        displayName: "Unknown User",
        uid: ""
      };

    navigation.navigate(
      "PrivateChat",
      {
        user: otherUser
      }
    );

  }

  function renderItem({ item }) {

    if (item.sponsored) {
      return <SponsoredChatItem ad={item} />;
    }

    const otherUser =
      item.users?.find(
        u => u.uid !== user.uid
      ) || {
        displayName: "Unknown User"
      };

    return (

      <TouchableOpacity
        style={styles.card}
        onPress={() => openChat(item)}
      >

        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {otherUser.displayName
              ?.charAt(0)
              ?.toUpperCase() || "?"}
          </Text>

        </View>

        <View style={styles.info}>

          <Text style={styles.name}>
            {otherUser.displayName}
          </Text>

          <Text
            numberOfLines={1}
            style={styles.message}
          >
            {item.lastMessage || "No messages"}
          </Text>

        </View>

      </TouchableOpacity>

    );

  }

  // Interleave one sponsored post after every 5 real chats, cycling
  // through whatever active chat-list ads exist.
  const listData = useMemo(() => {

    if (sponsoredAds.length === 0) return chats;

    const merged = [];
    let adIndex = 0;

    chats.forEach((chat, i) => {

      merged.push(chat);

      if ((i + 1) % 5 === 0) {
        const ad = sponsoredAds[adIndex % sponsoredAds.length];
        merged.push({ ...ad, sponsored: true, listKey: `ad-${ad.id}-${i}` });
        adIndex++;
      }

    });

    return merged;

  }, [chats, sponsoredAds]);

  return (

    <SafeAreaView style={styles.container} edges={["top"]}>

      <View style={styles.topBar}>

        <Text style={styles.title}>
          Chats
        </Text>

        <View style={styles.topBarActions}>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Status")}
          >
            <Text style={styles.iconButtonText}>📸</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Groups")}
          >
            <Text style={styles.iconButtonText}>👥</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Calls")}
          >
            <Text style={styles.iconButtonText}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.iconButtonText}>⚙️</Text>
          </TouchableOpacity>

        </View>

      </View>

      <TouchableOpacity
        style={styles.newChatFab}
        onPress={() => navigation.navigate("Contacts")}
      >
        <Text style={styles.newChatFabText}>
          + New Chat
        </Text>
      </TouchableOpacity>

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={listData}
        keyExtractor={item => item.listKey || item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No chats yet.
            </Text>
            <Text style={styles.emptySubtext}>
              Tap "+ New Chat" to message someone.
            </Text>
          </View>
        }
      />

      <BannerAd />

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  topBar:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    paddingHorizontal:15,
    paddingVertical:12,
    backgroundColor:"#0D1117"
  },

  title:{
    fontSize:20,
    fontWeight:"bold",
    color:"#E6F7F3"
  },

  newChatButton:{
    backgroundColor:"#00E676",
    paddingHorizontal:12,
    paddingVertical:8,
    borderRadius:20
  },

  newChatButtonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:13
  },

  topBarActions:{
    flexDirection:"row",
    alignItems:"center"
  },

  iconButton:{
    marginLeft:14
  },

  iconButtonText:{
    fontSize:20
  },

  newChatFab:{
    position:"absolute",
    right:20,
    bottom:20,
    zIndex:10,
    backgroundColor:"#00E676",
    paddingHorizontal:18,
    paddingVertical:14,
    borderRadius:30,
    elevation:4,
    shadowColor:"#000",
    shadowOpacity:0.3,
    shadowOffset:{ width:0, height:2 },
    shadowRadius:4
  },

  newChatFabText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:14
  },

  card:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#12181C",
    padding:15,
    marginHorizontal:10,
    marginTop:10,
    borderRadius:10
  },

  avatar:{
    width:55,
    height:55,
    borderRadius:28,
    backgroundColor:"#0D1117",
    justifyContent:"center",
    alignItems:"center"
  },

  avatarText:{
    color:"#E6F7F3",
    fontSize:22,
    fontWeight:"bold"
  },

  info:{
    marginLeft:15,
    flex:1
  },

  name:{
    color: "#E6F7F3",
    fontSize:17,
    fontWeight:"bold"
  },

  message:{
    color:"#9BA3AE",
    marginTop:5
  },

  empty:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    marginTop:80
  },

  emptyText:{
    fontSize:18,
    color:"#9BA3AE"
  },

  emptySubtext:{
    fontSize:14,
    color:"#9BA3AE",
    marginTop:6
  }

});
