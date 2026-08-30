import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import useIsAdmin from "../hooks/useIsAdmin";

export default function SettingsScreen({ navigation }) {

  const isAdmin = useIsAdmin();

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.itemText}>👤 Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Privacy")}
      >
        <Text style={styles.itemText}>🔒 Privacy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Backup")}
      >
        <Text style={styles.itemText}>💾 Chat Backup</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
      >
        <Text style={styles.itemText}>🔔 Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("AdvertiseWithUs")}
      >
        <Text style={styles.itemText}>📢 Advertise with us</Text>
      </TouchableOpacity>

      {isAdmin ? (
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("AdminDashboard")}
        >
          <Text style={styles.itemText}>🛠️ Ad Dashboard</Text>
        </TouchableOpacity>
      ) : null}

      {isAdmin ? (
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("Reports")}
        >
          <Text style={styles.itemText}>🚩 Reports</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("PrivacyPolicy")}
      >
        <Text style={styles.itemText}>📄 Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("About")}
      >
        <Text style={styles.itemText}>ℹ️ About</Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117",
    padding:20
  },

  item:{
    backgroundColor:"#12181C",
    padding:18,
    borderRadius:10,
    marginBottom:15
  },

  itemText:{
    color:"#E6F7F3",
    fontSize:15
  }

});
