import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image
} from "react-native";

import { AuthContext } from "../context/AuthContext";

export default function MessageBubble({ message }) {

  const { user } = useContext(AuthContext);

  const mine =
    message.senderUid === user?.uid;

  function getStatus() {

    switch (message.status) {

      case "sent":
        return "✓";

      case "delivered":
        return "✓✓";

      case "read":
        return "✓✓";

      default:
        return "";

    }

  }

  function getTime() {

    if (!message.createdAt?.seconds)
      return "";

    const date = new Date(
      message.createdAt.seconds * 1000
    );

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  }

  return (

    <View
      style={[
        styles.container,
        mine
          ? styles.right
          : styles.left
      ]}
    >

      <View
        style={[
          styles.bubble,
          mine
            ? styles.myBubble
            : styles.otherBubble
        ]}
      >

        {message.imageUrl ? (

          <Image
            source={{ uri: message.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

        ) : null}

        {message.text ? (

          <Text style={styles.message}>
            {message.text}
          </Text>

        ) : null}

        <View style={styles.footer}>

          <Text style={styles.time}>
            {getTime()}
          </Text>

          {mine ? (

            <Text
              style={[
                styles.status,
                message.status === "read"
                  ? styles.read
                  : null
              ]}
            >
              {getStatus()}
            </Text>

          ) : null}

        </View>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    marginVertical:4,
    paddingHorizontal:10
  },

  left:{
    alignItems:"flex-start"
  },

  right:{
    alignItems:"flex-end"
  },

  bubble:{
    maxWidth:"80%",
    borderRadius:12,
    padding:10
  },

  myBubble:{
    backgroundColor:"#DCF8C6"
  },

  otherBubble:{
    backgroundColor:"#FFFFFF"
  },

  image:{
    width:220,
    height:220,
    borderRadius:10,
    marginBottom:8
  },

  message:{
    fontSize:16,
    color:"#000"
  },

  footer:{
    flexDirection:"row",
    justifyContent:"flex-end",
    alignItems:"center",
    marginTop:5
  },

  time:{
    fontSize:11,
    color:"#666"
  },

  status:{
    marginLeft:5,
    color:"#666"
  },

  read:{
    color:"#34B7F1"
  }

});
