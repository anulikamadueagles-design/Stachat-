import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";

import {
  AD_PLACEMENTS,
  subscribeActiveAds,
  recordImpression,
  recordClick,
} from "../services/AdService";

const SKIP_DELAY_MS = 3000;

// Module-level (not per-component) so it survives remounts and only
// fires once per app session, not once per screen visit.
let hasShownThisSession = false;

export default function InterstitialAd() {

  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (hasShownThisSession) return;

    const unsubscribe = subscribeActiveAds(AD_PLACEMENTS.FULLSCREEN, (ads) => {
      if (ads.length > 0 && !hasShownThisSession) {
        hasShownThisSession = true;
        setAd(ads[0]);

        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!visible || !ad) return;

    if (!loggedRef.current) {
      loggedRef.current = true;
      recordImpression(ad.id);
    }

    const timer = setTimeout(() => setCanSkip(true), SKIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visible, ad?.id]);

  if (!ad) return null;

  function close() {
    setVisible(false);
  }

  function handlePress() {
    recordClick(ad.id);
    Linking.openURL(ad.linkUrl).catch(() => {});
    close();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>

          {ad.imageUrl ? (
            <Image source={{ uri: ad.imageUrl }} style={styles.image} />
          ) : null}

          <View style={styles.textWrap}>
            <Text style={styles.business}>{ad.businessName}</Text>
            <Text style={styles.title}>{ad.title}</Text>
            {ad.description ? (
              <Text style={styles.description}>{ad.description}</Text>
            ) : null}
          </View>

          <Text style={styles.tag}>Sponsored</Text>

        </TouchableOpacity>

        {canSkip ? (
          <TouchableOpacity style={styles.closeButton} onPress={close}>
            <Text style={styles.closeText}>✕ Skip</Text>
          </TouchableOpacity>
        ) : null}

      </View>
    </Modal>
  );

}

const styles = StyleSheet.create({

  backdrop:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.85)",
    justifyContent:"center",
    alignItems:"center"
  },

  card:{
    width:"85%",
    backgroundColor:"#12181C",
    borderRadius:16,
    overflow:"hidden"
  },

  image:{
    width:"100%",
    height:220
  },

  textWrap:{
    padding:18
  },

  business:{
    fontSize:12,
    color:"#9BA3AE",
    fontWeight:"bold"
  },

  title:{
    color: "#E6F7F3",
    fontSize:18,
    fontWeight:"bold",
    marginTop:4
  },

  description:{
    fontSize:14,
    color:"#9BA3AE",
    marginTop:6
  },

  tag:{
    position:"absolute",
    top:10,
    left:10,
    backgroundColor:"rgba(0,0,0,0.5)",
    color:"#E6F7F3",
    fontSize:11,
    fontWeight:"bold",
    paddingHorizontal:8,
    paddingVertical:3,
    borderRadius:8,
    overflow:"hidden"
  },

  closeButton:{
    marginTop:20,
    paddingHorizontal:20,
    paddingVertical:10
  },

  closeText:{
    color:"#E6F7F3",
    fontSize:16,
    fontWeight:"bold"
  }

});
