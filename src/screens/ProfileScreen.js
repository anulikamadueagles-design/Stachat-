import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native";

import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen() {

  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.displayName
            ? user.displayName.charAt(0).toUpperCase()
            : "S"}
        </Text>
      </View>

      <Text style={styles.name}>
        {user?.displayName || "STAChat User"}
      </Text>

      <Text style={styles.email}>
        {user?.email || "No email"}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={logout}
      >
        <Text style={styles.buttonText}>
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECE5DD",
    padding: 20
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#075E54",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },

  avatarText: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "bold"
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10
  },

  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40
  },

  button: {
    backgroundColor: "#075E54",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }

});
