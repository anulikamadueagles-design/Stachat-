import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

export default function VideoCallScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Calls</Text>
      <Text style={styles.message}>
        Video calling is available in the mobile app.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation?.goBack?.()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#075E54",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
