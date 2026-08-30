import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { subscribeMyGroups } from "../groupchat/GroupService";
import { AD_PLACEMENTS, subscribeActiveAds, recordImpression, recordClick } from "../services/AdService";

export default function GroupsScreen({ navigation }) {

  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [channelAds, setChannelAds] = useState([]);
  const loggedAdRef = useRef(null);

  useEffect(() => {

    // Server-filtered now — subscribeMyGroups only streams groups this
    // user actually belongs to.
    return subscribeMyGroups(user.uid, setGroups);

  }, []);

  useEffect(() => {
    return subscribeActiveAds(AD_PLACEMENTS.CHANNEL, setChannelAds);
  }, []);

  const featuredChannelAd = channelAds[0] || null;

  useEffect(() => {
    if (featuredChannelAd && loggedAdRef.current !== featuredChannelAd.id) {
      loggedAdRef.current = featuredChannelAd.id;
      recordImpression(featuredChannelAd.id);
    }
  }, [featuredChannelAd?.id]);

  function handleChannelAdPress() {
    if (!featuredChannelAd) return;
    recordClick(featuredChannelAd.id);
    Linking.openURL(featuredChannelAd.linkUrl).catch(() => {});
  }

  return (

    <SafeAreaView style={styles.container} edges={["top"]}>

      <View style={styles.topBar}>

        <Text style={styles.title}>
          Groups
        </Text>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate("CreateGroup")}
        >
          <Text style={styles.newButtonText}>
            + New Group
          </Text>
        </TouchableOpacity>

      </View>

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={groups}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          featuredChannelAd ? (
            <TouchableOpacity
              style={styles.channelAdCard}
              onPress={handleChannelAdPress}
            >
              {featuredChannelAd.imageUrl ? (
                <Image
                  source={{ uri: featuredChannelAd.imageUrl }}
                  style={styles.channelAdImage}
                />
              ) : null}
              <View style={styles.channelAdBody}>
                <Text style={styles.channelAdTag}>Sponsored Channel</Text>
                <Text style={styles.channelAdTitle}>{featuredChannelAd.title}</Text>
                <Text style={styles.channelAdBusiness}>{featuredChannelAd.businessName}</Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("GroupChat", {
                group: item
              })
            }
          >

            <Text style={styles.cardTitle}>
              {item.name}
            </Text>

            <Text style={styles.subtitle}>
              {item.members?.length || 0} members
            </Text>

          </TouchableOpacity>

        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No groups yet.</Text>
            <Text style={styles.emptySubtext}>
              Tap "+ New Group" to start one.
            </Text>
          </View>
        }
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
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    paddingHorizontal:15,
    paddingVertical:12,
    backgroundColor:"#0D1117"
  },

  title:{
    fontSize:20,
    fontWeight:"bold",
    color:"#E6F7F3"
  },

  newButton:{
    backgroundColor:"#00E676",
    paddingHorizontal:12,
    paddingVertical:8,
    borderRadius:20
  },

  newButtonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:13
  },

  card:{
    backgroundColor:"#12181C",
    margin:10,
    padding:15,
    borderRadius:10
  },

  channelAdCard:{
    flexDirection:"row",
    backgroundColor:"#12181C",
    margin:10,
    borderRadius:10,
    borderWidth:1,
    borderColor:"#3A2E1A",
    overflow:"hidden"
  },

  channelAdImage:{
    width:70,
    height:70
  },

  channelAdBody:{
    flex:1,
    padding:10,
    justifyContent:"center"
  },

  channelAdTag:{
    fontSize:10,
    color:"#FFA000",
    fontWeight:"bold"
  },

  channelAdTitle:{
    color: "#E6F7F3",
    fontSize:15,
    fontWeight:"bold",
    marginTop:2
  },

  channelAdBusiness:{
    fontSize:12,
    color:"#9BA3AE",
    marginTop:2
  },

  cardTitle:{
    color: "#E6F7F3",
    fontSize:18,
    fontWeight:"bold"
  },

  subtitle:{
    color:"#9BA3AE",
    marginTop:5
  },

  empty:{
    alignItems:"center",
    marginTop:60
  },

  emptyText:{
    fontSize:18,
    color:"#9BA3AE"
  },

  emptySubtext:{
    fontSize:14,
    color:"#9BA3AE",
    marginTop:6
  }

});
