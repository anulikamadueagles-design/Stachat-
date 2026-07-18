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

export default function ContactsScreen({ navigation }) {

  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

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

    return (

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("PrivateChat", {
            user: item
          })
        }
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
                item.online ? "#25D366" : "#999"
            }
          ]}
        />

      </TouchableOpacity>

    );

  }

  return (

    <View style={styles.container}>

      <FlatList
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
    backgroundColor:"#ECE5DD"
  },

  card:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"#fff",
    padding:15,
    marginHorizontal:10,
    marginTop:10,
    borderRadius:10
  },

  name:{
    fontSize:17,
    fontWeight:"bold"
  },

  email:{
    color:"gray",
    marginTop:4
  },

  status:{
    width:12,
    height:12,
    borderRadius:6
  }

});
