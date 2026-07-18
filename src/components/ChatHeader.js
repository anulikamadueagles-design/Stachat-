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

    <View style={styles.container}>

      <View style={styles.left}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName
              ? user.displayName.charAt(0).toUpperCase()
              : "U"}
          </Text>
        </View>

        <View>

          <Text style={styles.name}>
            {user?.displayName || "Unknown User"}
          </Text>

          <Text style={styles.status}>
            {user?.online ? "🟢 Online" : "⚪ Offline"}
          </Text>

        </View>

      </View>

      <View style={styles.right}>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("VoiceCall", { user })
          }
        >
          <Text style={styles.icon}>📞</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("VideoCall", { user })
          }
        >
          <Text style={styles.icon}>🎥</Text>
        </TouchableOpacity>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"#075E54",
    padding:12
  },

  left:{
    flexDirection:"row",
    alignItems:"center"
  },

  avatar:{
    width:45,
    height:45,
    borderRadius:23,
    backgroundColor:"#25D366",
    justifyContent:"center",
    alignItems:"center",
    marginRight:10
  },

  avatarText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:20
  },

  name:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16
  },

  status:{
    color:"#ddd",
    fontSize:12
  },

  right:{
    flexDirection:"row"
  },

  button:{
    marginLeft:15
  },

  icon:{
    fontSize:24
  }

});
