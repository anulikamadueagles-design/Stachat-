import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

export default function SettingsScreen({ navigation }) {

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text>👤 Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Privacy")}
      >
        <Text>🔒 Privacy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
      >
        <Text>🔔 Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
      >
        <Text>ℹ️ About</Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#ECE5DD",
    padding:20
  },

  item:{
    backgroundColor:"#fff",
    padding:18,
    borderRadius:10,
    marginBottom:15
  }

});
