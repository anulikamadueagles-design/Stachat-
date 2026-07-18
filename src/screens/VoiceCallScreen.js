import React, {
  useEffect,
  useState
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import {
  endCall
} from "../services/CallService";

export default function VoiceCallScreen({
  route,
  navigation
}) {

  const { user, callId } = route.params;

  const [seconds, setSeconds] = useState(0);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {

    const timer = setInterval(() => {
      setSeconds(value => value + 1);
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  async function hangUp() {

    await endCall(callId);

    navigation.goBack();

  }

  function formatTime() {

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${min}:${sec
      .toString()
      .padStart(2,"0")}`;

  }

  return (

    <View style={styles.container}>

      <Text style={styles.name}>
        {user.displayName || user.email}
      </Text>

      <Text style={styles.status}>
        Voice Call
      </Text>

      <Text style={styles.timer}>
        {formatTime()}
      </Text>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.control}
          onPress={() =>
            setMute(!mute)
          }
        >
          <Text>
            {mute ? "🎤 Off" : "🎤 On"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.control}
          onPress={() =>
            setSpeaker(!speaker)
          }
        >
          <Text>
            {speaker ? "🔊 On" : "🔈 Off"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.end}
          onPress={hangUp}
        >
          <Text style={styles.endText}>
            End
          </Text>
        </TouchableOpacity>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#075E54",
    justifyContent:"center",
    alignItems:"center"
  },

  name:{
    color:"#fff",
    fontSize:28,
    fontWeight:"bold"
  },

  status:{
    color:"#ddd",
    marginTop:10,
    fontSize:18
  },

  timer:{
    color:"#fff",
    marginTop:20,
    fontSize:20
  },

  buttons:{
    flexDirection:"row",
    marginTop:60
  },

  control:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:30,
    marginHorizontal:10
  },

  end:{
    backgroundColor:"#E53935",
    padding:15,
    borderRadius:30,
    marginHorizontal:10
  },

  endText:{
    color:"#fff",
    fontWeight:"bold"
  }

});
