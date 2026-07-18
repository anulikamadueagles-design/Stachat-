import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { subscribeGroups } from "../groupchat/GroupService";

export default function GroupsScreen({ navigation }) {

  const [groups, setGroups] = useState([]);

  useEffect(() => {

    return subscribeGroups(setGroups);

  }, []);

  return (

    <View style={styles.container}>

      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("GroupChat", {
                group: item
              })
            }
          >

            <Text style={styles.title}>
              {item.name}
            </Text>

            <Text style={styles.subtitle}>
              {item.members?.length || 0} members
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

  card:{
    backgroundColor:"#fff",
    margin:10,
    padding:15,
    borderRadius:10
  },

  title:{
    fontSize:18,
    fontWeight:"bold"
  },

  subtitle:{
    color:"gray",
    marginTop:5
  }

});
