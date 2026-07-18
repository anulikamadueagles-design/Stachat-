import React from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet
} from "react-native";

export default function PrivacyScreen() {

  return (

    <View style={styles.container}>

      <View style={styles.item}>

        <Text style={styles.text}>
          Show Last Seen
        </Text>

        <Switch value={true} />

      </View>

      <View style={styles.item}>

        <Text style={styles.text}>
          Show Online Status
        </Text>

        <Switch value={true} />

      </View>

      <View style={styles.item}>

        <Text style={styles.text}>
          Read Receipts
        </Text>

        <Switch value={true} />

      </View>

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
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"#fff",
    padding:15,
    marginBottom:15,
    borderRadius:10
  },

  text:{
    fontSize:16
  }

});
