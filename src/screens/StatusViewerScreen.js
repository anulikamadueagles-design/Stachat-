import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
} from "react-native";

import { Video, ResizeMode } from "expo-av";
import { AuthContext } from "../context/AuthContext";
import { markStatusViewed } from "../services/StatusService";
import { recordImpression, recordClick } from "../services/AdService";

const DURATION_MS = 5000;

export default function StatusViewerScreen({ route, navigation }) {

  const { user } = useContext(AuthContext);
  const { group } = route.params;

  const [index, setIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const items = group.items;
  const current = items[index];

  useEffect(() => {

    if (current) {
      if (group.sponsored) {
        recordImpression(group.adId);
      } else {
        markStatusViewed(current.id, user.uid).catch(() => {});
      }
    }

    progress.setValue(0);

    if (timerRef.current) clearTimeout(timerRef.current);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) goNext();
    });

    return () => animation.stop();

  }, [index]);

  function goNext() {
    if (index < items.length - 1) {
      setIndex(i => i + 1);
    } else {
      navigation.goBack();
    }
  }

  function goPrev() {
    if (index > 0) {
      setIndex(i => i - 1);
    } else {
      navigation.goBack();
    }
  }

  function handleSponsoredTap() {
    recordClick(group.adId);
    Linking.openURL(group.linkUrl).catch(() => {});
  }

  if (!current) return null;

  return (

    <View style={styles.container}>

      <View style={styles.progressRow}>
        {items.map((item, i) => (
          <View key={item.id} style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width:
                    i < index
                      ? "100%"
                      : i === index
                      ? progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        })
                      : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      <Text style={styles.name}>{group.name}</Text>

      {group.sponsored ? (
        <TouchableOpacity style={styles.ctaButton} onPress={handleSponsoredTap}>
          <Text style={styles.ctaText}>Learn More</Text>
        </TouchableOpacity>
      ) : null}

      {current.mediaType === "video" ? (
        <Video
          source={{ uri: current.mediaUrl }}
          style={styles.media}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          useNativeControls={false}
        />
      ) : (
        <Image
          source={{ uri: current.mediaUrl }}
          style={styles.media}
          resizeMode="contain"
        />
      )}

      <View style={styles.tapZones}>
        <TouchableOpacity style={styles.tapZone} onPress={goPrev} />
        <TouchableOpacity style={styles.tapZone} onPress={goNext} />
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

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

  progressRow:{
    position:"absolute",
    top:50,
    left:10,
    right:10,
    flexDirection:"row",
    zIndex:2
  },

  progressTrack:{
    flex:1,
    height:3,
    backgroundColor:"rgba(255,255,255,0.3)",
    marginHorizontal:2,
    borderRadius:2,
    overflow:"hidden"
  },

  progressFill:{
    height:3,
    backgroundColor:"#12181C"
  },

  name:{
    position:"absolute",
    top:65,
    left:15,
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:15,
    zIndex:2
  },

  ctaButton:{
    position:"absolute",
    bottom:50,
    alignSelf:"center",
    backgroundColor:"#FFA000",
    paddingHorizontal:24,
    paddingVertical:12,
    borderRadius:24,
    zIndex:2
  },

  ctaText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:15
  },

  media:{
    width:"100%",
    height:"100%"
  },

  tapZones:{
    ...StyleSheet.absoluteFillObject,
    flexDirection:"row"
  },

  tapZone:{
    flex:1
  },

  closeButton:{
    position:"absolute",
    top:60,
    right:15,
    zIndex:2
  },

  closeText:{
    color:"#E6F7F3",
    fontSize:22,
    fontWeight:"bold"
  }

});
