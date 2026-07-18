import React, {
  useContext,
  useEffect,
  useState
} from "react";

import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";

export default function ChatsScreen({ navigation }) {

  const { user } = useContext(AuthContext);

  const [chats, setChats] = useState([]);

  useEffect(() => {

    if (!user) return;

    const q = query(
      collection(db, "privateChats"),
      orderBy("lastUpdated", "desc")
    );

    const unsubscribe = onSnapshot(q, snapshot => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const myChats = data.filter(chat =>
        chat.members &&
        chat.members.includes(user.uid)
      );

      setChats(myChats);

    });

    return unsubscribe;

  }, [user]);

  function openChat(chat) {

    const otherUser = chat.users.find(
      u => u.uid !== user.uid
    );

    navigation.navigate(
      "PrivateChat",
      {
        user: otherUser
      }
    );

  }

  function renderItem({ item }) {

    const otherUser =
      item.users.find(
        u => u.uid !== user.uid
      );

    return (

      <TouchableOpacity
        style={styles.card}
        onPress={() => openChat(item)}
      >

        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {otherUser.displayName
              ?.charAt(0)
              ?.toUpperCase()}
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

  return (

    <View style={styles.container}>

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#ECE5DD"
  },

  card:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#fff",
    padding:15,
    marginHorizontal:10,
    marginTop:10,
    borderRadius:10
  },

  avatar:{
    width:55,
    height:55,
    borderRadius:28,
    backgroundColor:"#075E54",
    justifyContent:"center",
    alignItems:"center"
  },

  avatarText:{
    color:"#fff",
    fontSize:22,
    fontWeight:"bold"
  },

  info:{
    marginLeft:15,
    flex:1
  },

  name:{
    fontSize:17,
    fontWeight:"bold"
  },

  message:{
    color:"gray",
    marginTop:5
  }

});
