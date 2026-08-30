import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { subscribeStatus, uploadStatus } from "../services/StatusService";
import { pickImage, pickVideo } from "../services/MediaService";
import { AD_PLACEMENTS, subscribeActiveAds } from "../services/AdService";

export default function StatusScreen({ navigation }) {

  const { user } = useContext(AuthContext);
  const [statuses, setStatuses] = useState([]);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return subscribeStatus(setStatuses);
  }, []);

  useEffect(() => {
    return subscribeActiveAds(AD_PLACEMENTS.STATUS, setSponsoredAds);
  }, []);

  const sponsoredGroups = useMemo(() => (
    sponsoredAds.map(ad => ({
      uid: `sponsored-${ad.id}`,
      name: `${ad.businessName} • Sponsored`,
      sponsored: true,
      adId: ad.id,
      linkUrl: ad.linkUrl,
      items: [{ id: ad.id, mediaUrl: ad.imageUrl, mediaType: "image" }],
    }))
  ), [sponsoredAds]);


  // Only statuses from the last 24h, grouped by author.
  const groups = useMemo(() => {

    const now = Date.now();
    const active = statuses.filter(s => (s.expiresAt || 0) > now);

    const byUser = {};

    active.forEach(status => {
      if (!byUser[status.uid]) {
        byUser[status.uid] = {
          uid: status.uid,
          name: status.name,
          items: [],
        };
      }
      byUser[status.uid].items.push(status);
    });

    return Object.values(byUser);

  }, [statuses]);

  const myStatuses = groups.find(g => g.uid === user.uid);
  const otherStatuses = groups.filter(g => g.uid !== user.uid);

  async function handleAddStatus() {

    setUploading(true);

    try {

      const image = await pickImage();

      if (image) {
        await uploadStatus(user, image, "image");
      }

    } catch (error) {

      console.log("Failed to upload status:", error);

    } finally {

      setUploading(false);

    }

  }

  function openViewer(group) {
    navigation.navigate("StatusViewer", { group });
  }

  return (

    <SafeAreaView style={styles.container} edges={["top"]}>

      <View style={styles.topBar}>
        <Text style={styles.title}>Status</Text>
      </View>

      <TouchableOpacity
        style={styles.myStatusRow}
        onPress={() =>
          myStatuses ? openViewer(myStatuses) : handleAddStatus()
        }
        onLongPress={handleAddStatus}
      >

        <View style={styles.ring}>
          {myStatuses?.items?.[0]?.mediaUrl ? (
            <Image
              source={{ uri: myStatuses.items[0].mediaUrl }}
              style={styles.avatar}
            />
          ) : (
            <Text style={styles.avatarInitial}>
              {(user.displayName || user.email || "?")[0].toUpperCase()}
            </Text>
          )}
          {uploading ? (
            <ActivityIndicator style={StyleSheet.absoluteFill} color="#00BFA5" />
          ) : (
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>+</Text>
            </View>
          )}
        </View>

        <View>
          <Text style={styles.name}>My Status</Text>
          <Text style={styles.subtitle}>
            {myStatuses
              ? `${myStatuses.items.length} update(s) · tap to view, hold to add`
              : "Tap to add a status update"}
          </Text>
        </View>

      </TouchableOpacity>

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={otherStatuses}
        keyExtractor={item => item.uid}
        ListHeaderComponent={
          <>
            {sponsoredGroups.map(group => (
              <TouchableOpacity
                key={group.uid}
                style={styles.row}
                onPress={() => openViewer(group)}
              >
                <View style={[styles.ring, styles.sponsoredRing]}>
                  <Image
                    source={{ uri: group.items[0].mediaUrl }}
                    style={styles.avatar}
                  />
                </View>
                <View>
                  <Text style={styles.name}>{group.name}</Text>
                  <Text style={styles.subtitle}>Sponsored</Text>
                </View>
              </TouchableOpacity>
            ))}
            {otherStatuses.length > 0 ? (
              <Text style={styles.sectionLabel}>Recent updates</Text>
            ) : null}
          </>
        }
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.row}
            onPress={() => openViewer(item)}
          >

            <View style={styles.ring}>
              <Image
                source={{ uri: item.items[0].mediaUrl }}
                style={styles.avatar}
              />
            </View>

            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subtitle}>
                {item.items.length} update(s)
              </Text>
            </View>

          </TouchableOpacity>

        )}
      />

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  topBar:{
    paddingHorizontal:15,
    paddingVertical:12,
    backgroundColor:"#0D1117"
  },

  title:{
    fontSize:20,
    fontWeight:"bold",
    color:"#E6F7F3"
  },

  myStatusRow:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#12181C",
    padding:12,
    margin:10,
    borderRadius:10
  },

  row:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#12181C",
    padding:12,
    marginHorizontal:10,
    marginBottom:8,
    borderRadius:10
  },

  ring:{
    width:52,
    height:52,
    borderRadius:26,
    borderWidth:2,
    borderColor:"#00E676",
    justifyContent:"center",
    alignItems:"center",
    marginRight:12,
    overflow:"visible"
  },

  sponsoredRing:{
    borderColor:"#FFA000"
  },

  avatar:{
    width:44,
    height:44,
    borderRadius:22
  },

  avatarInitial:{
    fontSize:20,
    fontWeight:"bold",
    color:"#00BFA5"
  },

  plusBadge:{
    position:"absolute",
    bottom:-2,
    right:-2,
    width:18,
    height:18,
    borderRadius:9,
    backgroundColor:"#00E676",
    justifyContent:"center",
    alignItems:"center",
    borderWidth:2,
    borderColor:"#21262D"
  },

  plusBadgeText:{
    color:"#E6F7F3",
    fontSize:12,
    fontWeight:"bold"
  },

  name:{
    color: "#E6F7F3",
    fontSize:16,
    fontWeight:"600"
  },

  subtitle:{
    fontSize:12,
    color:"#9BA3AE",
    marginTop:2
  },

  sectionLabel:{
    marginHorizontal:15,
    marginBottom:6,
    color:"#9BA3AE",
    fontSize:13
  }

});
