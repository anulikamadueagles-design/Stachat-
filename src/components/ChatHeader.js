import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function ChatHeader({ user }) {

  const navigation = useNavigation();

  return (

    <View style={styles.header}>

      <View>

        <Text style={styles.name}>
          {user?.displayName || "Unknown User"}
        </Text>

        <Text style={styles.status}>
          Online
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

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  header:{
    backgroundColor:"#075E54",
    padding:15,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },

  name:{
    color:"#fff",
    fontSize:18,
    fontWeight:"bold"
  },

  status:{
    color:"#ddd",
    fontSize:12
  },

  actions:{
    flexDirection:"row"
  },

  icon:{
    color:"#fff",
    fontSize:24,
    marginLeft:20
  }

});
