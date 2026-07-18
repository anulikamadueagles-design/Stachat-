import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

export default function VoiceCallScreen({ route, navigation }) {

  const { user } = route.params;
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function formatTime() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  return (

    <View style={styles.container}>

      <Text style={styles.name}>
        {user?.displayName || "Unknown"}
      </Text>

      <Text style={styles.status}>
        Voice Call
      </Text>

      <Text style={styles.timer}>
        {formatTime()}
      </Text>

      <View style={styles.controls}>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setMuted(!muted)}
        >
          <Text>{muted ? "🎤 Off" : "🎤 On"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setSpeaker(!speaker)}
        >
          <Text>{speaker ? "🔊 On" : "🔈 Off"}</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.end}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.endText}>
          End Call
        </Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#075E54",
    justifyContent:"center",
    alignItems:"center",
    padding:20
  },

  name:{
    fontSize:28,
    color:"#fff",
    fontWeight:"bold"
  },

  status:{
    fontSize:18,
    color:"#ddd",
    marginTop:10
  },

  timer:{
    fontSize:32,
    color:"#fff",
    marginVertical:30
  },

  controls:{
    flexDirection:"row",
    marginBottom:40
  },

  button:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:30,
    marginHorizontal:10
  },

  end:{
    backgroundColor:"#E53935",
    paddingHorizontal:30,
    paddingVertical:15,
    borderRadius:30
  },

  endText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16
  }

});
