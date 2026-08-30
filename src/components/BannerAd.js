import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";

import { AD_PLACEMENTS, subscribeActiveAds, recordImpression, recordClick } from "../services/AdService";

const ROTATE_INTERVAL_MS = 12000;

export default function BannerAd() {

  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);
  const loggedRef = useRef(null);

  useEffect(() => {
    return subscribeActiveAds(AD_PLACEMENTS.BANNER, (list) => {
      setAds(list);
      setIndex(0);
    });
  }, []);

  // Rotate among all active banner ads instead of only ever showing
  // the first one — otherwise later advertisers would never get shown.
  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [ads.length]);

  const ad = ads[index] || null;

  useEffect(() => {
    if (ad && loggedRef.current !== ad.id) {
      loggedRef.current = ad.id;
      recordImpression(ad.id);
    }
  }, [ad?.id]);

  if (!ad) return null;

  function handlePress() {
    recordClick(ad.id);
    Linking.openURL(ad.linkUrl).catch(() => {});
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>

      {ad.imageUrl ? (
        <Image source={{ uri: ad.imageUrl }} style={styles.image} />
      ) : null}

      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>{ad.title}</Text>
        <Text style={styles.business} numberOfLines={1}>{ad.businessName}</Text>
      </View>

      <Text style={styles.tag}>Ad</Text>

    </TouchableOpacity>
  );

}

const styles = StyleSheet.create({

  container:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#12181C",
    borderTopWidth:1,
    borderTopColor:"#21262D",
    paddingHorizontal:12,
    paddingVertical:8
  },

  image:{
    width:36,
    height:36,
    borderRadius:6,
    marginRight:10
  },

  textWrap:{
    flex:1
  },

  title:{
    color: "#E6F7F3",
    fontSize:13,
    fontWeight:"600"
  },

  business:{
    fontSize:11,
    color:"#9BA3AE"
  },

  tag:{
    fontSize:10,
    color:"#9BA3AE",
    fontWeight:"bold",
    marginLeft:8
  }

});
