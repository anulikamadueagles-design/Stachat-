import React from "react";
import {
  View,
  Image,
  StyleSheet
} from "react-native";

export default function StatusViewerScreen({ route }) {

  const { status } = route.params;

  return (

    <View style={styles.container}>

      <Image
        source={{ uri: status.mediaUrl }}
        style={styles.image}
        resizeMode="contain"
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#000",
    justifyContent:"center",
    alignItems:"center"
  },

  image:{
    width:"100%",
    height:"100%"
  }

});
