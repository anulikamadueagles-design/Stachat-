import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";

import { recordImpression, recordClick } from "../services/AdService";

export default function SponsoredChatItem({ ad }) {

  const impressionLogged = useRef(false);

  useEffect(() => {
    if (!impressionLogged.current) {
      impressionLogged.current = true;
      recordImpression(ad.id);
    }
  }, [ad.id]);

  function handlePress() {
    recordClick(ad.id);
    Linking.openURL(ad.linkUrl).catch(() => {});
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>

      {ad.imageUrl ? (
        <Image source={{ uri: ad.imageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {(ad.businessName || "A")[0].toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{ad.businessName}</Text>
          <Text style={styles.sponsoredTag}>Sponsored</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>{ad.title}</Text>
      </View>

    </TouchableOpacity>
  );

}

const styles = StyleSheet.create({

  card:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#12181C",
    padding:12,
    marginHorizontal:10,
    marginVertical:4,
    borderRadius:10,
    borderWidth:1,
    borderColor:"#3A2E1A"
  },

  avatar:{
    width:48,
    height:48,
    borderRadius:24,
    marginRight:12
  },

  avatarPlaceholder:{
    width:48,
    height:48,
    borderRadius:24,
    backgroundColor:"#FFA000",
    justifyContent:"center",
    alignItems:"center",
    marginRight:12
  },

  avatarInitial:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:18
  },

  body:{
    flex:1
  },

  topRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },

  name:{
    color: "#E6F7F3",
    fontSize:15,
    fontWeight:"bold",
    flex:1
  },

  sponsoredTag:{
    fontSize:10,
    color:"#FFA000",
    fontWeight:"bold",
    marginLeft:6
  },

  message:{
    fontSize:13,
    color:"#9BA3AE",
    marginTop:2
  }

});
