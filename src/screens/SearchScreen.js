import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet
} from "react-native";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "../config/firebase";

export default function SearchScreen({ navigation }) {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      snapshot => {

        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUsers(list);

      }
    );

    return unsubscribe;

  }, []);

  const filtered = users.filter(user =>
    user.displayName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <View style={styles.container}>

      <TextInput
        style={styles.search}
        placeholder="Search users..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.uid}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate(
                "PrivateChat",
                { user: item }
              )
            }
          >

            <Text style={styles.name}>
              {item.displayName}
            </Text>

            <Text style={styles.email}>
              {item.email}
            </Text>

          </TouchableOpacity>

        )}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#ECE5DD"
  },

  search:{
    backgroundColor:"#fff",
    margin:10,
    borderRadius:10,
    padding:15
  },

  card:{
    backgroundColor:"#fff",
    padding:15,
    marginHorizontal:10,
    marginBottom:10,
    borderRadius:10
  },

  name:{
    fontWeight:"bold",
    fontSize:17
  },

  email:{
    color:"gray"
  }

});
