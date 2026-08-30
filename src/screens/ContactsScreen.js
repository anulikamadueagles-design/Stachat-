import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import { forwardMessage } from "../services/ChatService";
import { addMember } from "../groupchat/GroupService";

export default function ContactsScreen({ navigation, route }) {

  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const forwardMessageParam = route?.params?.forwardMessage || null;
  const addToGroupId = route?.params?.addToGroupId || null;

  useEffect(() => {

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const list = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(item => item.uid !== user?.uid);

        setUsers(list);

      }
    );

    return unsubscribe;

  }, []);

  function renderItem({ item }) {

    async function handlePress() {

      if (forwardMessageParam) {
        await forwardMessage(user, item, forwardMessageParam);
        navigation.navigate("PrivateChat", { user: item });
        return;
      }

      if (addToGroupId) {
        await addMember(addToGroupId, item.uid);
        navigation.goBack();
        return;
      }

      navigation.navigate("PrivateChat", {
        user: item
      });

    }

    return (

      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
      >

        <View>

          <Text style={styles.name}>
            {item.displayName}
          </Text>

          <Text style={styles.email}>
            {item.email}
          </Text>

        </View>

        <View
          style={[
            styles.status,
            {
              backgroundColor:
                item.online ? "#00E676" : "#9BA3AE"
            }
          ]}
        />

      </TouchableOpacity>

    );

  }

  return (

    <View style={styles.container}>

      {forwardMessageParam || addToGroupId ? (
        <View style={styles.forwardBanner}>
          <Text style={styles.forwardBannerText}>
            {forwardMessageParam ? "Forward message to..." : "Add member to group..."}
          </Text>
        </View>
      ) : null}

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  forwardBanner:{
    backgroundColor:"#0D1117",
    padding:12
  },

  forwardBannerText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    textAlign:"center"
  },

  card:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"#12181C",
    padding:15,
    marginHorizontal:10,
    marginTop:10,
    borderRadius:10
  },

  name:{
    color: "#E6F7F3",
    fontSize:17,
    fontWeight:"bold"
  },

  email:{
    color:"#9BA3AE",
    marginTop:4
  },

  status:{
    width:12,
    height:12,
    borderRadius:6
  }

});
