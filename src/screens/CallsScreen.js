import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from "react-native";

export default function CallsScreen() {

  const [calls] = useState([
    {
      id: "1",
      name: "John Doe",
      type: "Voice",
      status: "Completed",
      time: "10:30 AM"
    },
    {
      id: "2",
      name: "Jane Smith",
      type: "Video",
      status: "Missed",
      time: "Yesterday"
    }
  ]);

  function renderItem({ item }) {

    return (

      <View style={styles.card}>

        <View>

          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.info}>
            {item.type} • {item.status}
          </Text>

        </View>

        <Text style={styles.time}>
          {item.time}
        </Text>

      </View>

    );

  }

  return (

    <View style={styles.container}>

      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
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
    margin:10,
    padding:15,
    borderRadius:10
  },

  name:{
    fontWeight:"bold",
    fontSize:16
  },

  info:{
    color:"#666",
    marginTop:4
  },

  time:{
    color:"#888"
  }

});
