import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

import { PRIVACY_POLICY_TEXT } from "../constants/privacyPolicyText";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.text}>{PRIVACY_POLICY_TEXT}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12181C",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    color: "#E6F7F3",
  },
});
