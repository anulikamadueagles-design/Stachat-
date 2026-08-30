import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function AboutScreen() {

  return (

    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Image
        source={require("../../assets/adaptive-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.wordmark}>
        <Text style={styles.wordmarkAccent}>STA</Text>Chat
      </Text>

      <Text style={styles.tagline}>Secure. Fast. Yours.</Text>

      <Text style={styles.version}>Version 1.0.0</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Created by</Text>
      <Text style={styles.creator}>David Kamsi Elvis</Text>

      <Text style={styles.sectionLabel}>Company</Text>
      <Text style={styles.company}>Element Tech</Text>

      <View style={styles.divider} />

      <Text style={styles.description}>
        STAChat is a fast, secure messaging app with real-time chat, voice
        and video calls, group messaging, status updates, and
        end-to-end encrypted text conversations.
      </Text>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} Element Tech. All rights reserved.
      </Text>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  content:{
    alignItems:"center",
    padding:30,
    paddingTop:50,
    paddingBottom:60
  },

  logo:{
    width:100,
    height:100,
    marginBottom:15
  },

  wordmark:{
    fontSize:26,
    fontWeight:"bold",
    color:"#E6F7F3"
  },

  wordmarkAccent:{
    color:"#00E676"
  },

  tagline:{
    fontSize:13,
    color:"#00BFA5",
    fontWeight:"600",
    letterSpacing:1,
    marginTop:4
  },

  version:{
    fontSize:12,
    color:"#9BA3AE",
    marginTop:10
  },

  divider:{
    height:1,
    backgroundColor:"#21262D",
    width:"100%",
    marginVertical:25
  },

  sectionLabel:{
    fontSize:12,
    color:"#9BA3AE",
    letterSpacing:0.5,
    textTransform:"uppercase"
  },

  creator:{
    fontSize:18,
    fontWeight:"bold",
    color:"#E6F7F3",
    marginTop:4,
    marginBottom:18
  },

  company:{
    fontSize:16,
    fontWeight:"600",
    color:"#00BFA5",
    marginTop:4
  },

  description:{
    fontSize:14,
    color:"#9BA3AE",
    textAlign:"center",
    lineHeight:21
  },

  footer:{
    fontSize:11,
    color:"#9BA3AE",
    marginTop:25
  }

});
