import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import useIsAdmin from "../hooks/useIsAdmin";
import {
  subscribeAllAds,
  updateAdStatus,
  markAdPaidAndActivate,
  deleteAd,
} from "../services/AdService";

function AdCard({ ad, onActivate, onPause, onResume, onEdit, onDelete }) {

  const ctr =
    ad.impressions > 0
      ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
      : "0.0";

  return (
    <View style={styles.card}>

      <View style={styles.cardHeader}>
        <Text style={styles.businessName}>{ad.businessName}</Text>
        <View style={[styles.statusBadge, styles[`status_${ad.status}`]]}>
          <Text style={styles.statusBadgeText}>{ad.status}</Text>
        </View>
      </View>

      <Text style={styles.title}>{ad.title}</Text>
      <Text style={styles.meta}>
        {ad.placement} · {ad.paymentStatus} · ${ad.amount || 0} {ad.currency}
      </Text>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>👁️ {ad.impressions || 0}</Text>
        <Text style={styles.stat}>👆 {ad.clicks || 0}</Text>
        <Text style={styles.stat}>CTR {ctr}%</Text>
      </View>

      <View style={styles.actionsRow}>

        {ad.status === "pending_payment" ? (
          <TouchableOpacity style={styles.actionBtn} onPress={onActivate}>
            <Text style={styles.actionText}>Mark Paid & Activate</Text>
          </TouchableOpacity>
        ) : null}

        {ad.status === "active" ? (
          <TouchableOpacity style={styles.actionBtn} onPress={onPause}>
            <Text style={styles.actionText}>Pause</Text>
          </TouchableOpacity>
        ) : null}

        {ad.status === "paused" ? (
          <TouchableOpacity style={styles.actionBtn} onPress={onResume}>
            <Text style={styles.actionText}>Resume</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

      </View>

    </View>
  );

}

export default function AdminDashboardScreen({ navigation }) {

  const isAdmin = useIsAdmin();
  const [ads, setAds] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    return subscribeAllAds(setAds);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <View style={styles.denied}>
        <Text style={styles.deniedText}>
          You don't have access to this page.
        </Text>
      </View>
    );
  }

  function confirmDelete(ad) {
    Alert.alert("Delete ad?", ad.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAd(ad.id).catch(() => {}),
      },
    ]);
  }

  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const activeCount = ads.filter((a) => a.status === "active").length;

  return (

    <View style={styles.container}>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{totalImpressions}</Text>
          <Text style={styles.summaryLabel}>Impressions</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{totalClicks}</Text>
          <Text style={styles.summaryLabel}>Clicks</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateAd", { mode: "admin" })}
      >
        <Text style={styles.createButtonText}>+ Create House Ad</Text>
      </TouchableOpacity>

      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AdCard
            ad={item}
            onActivate={() => markAdPaidAndActivate(item.id).catch(() => {})}
            onPause={() => updateAdStatus(item.id, "paused").catch(() => {})}
            onResume={() => updateAdStatus(item.id, "active").catch(() => {})}
            onEdit={() => navigation.navigate("CreateAd", { mode: "admin", editingAd: item })}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No ads yet.</Text>
          </View>
        }
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  denied:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#0D1117",
    padding:20
  },

  deniedText:{
    fontSize:16,
    color:"#9BA3AE",
    textAlign:"center"
  },

  summaryRow:{
    flexDirection:"row",
    padding:15
  },

  summaryBox:{
    flex:1,
    backgroundColor:"#12181C",
    borderRadius:10,
    padding:12,
    marginHorizontal:4,
    alignItems:"center"
  },

  summaryValue:{
    fontSize:20,
    fontWeight:"bold",
    color:"#00BFA5"
  },

  summaryLabel:{
    fontSize:11,
    color:"#9BA3AE",
    marginTop:2
  },

  createButton:{
    backgroundColor:"#00E676",
    marginHorizontal:15,
    marginBottom:10,
    padding:14,
    borderRadius:10,
    alignItems:"center"
  },

  createButtonText:{
    color:"#E6F7F3",
    fontWeight:"bold"
  },

  card:{
    backgroundColor:"#12181C",
    borderRadius:10,
    padding:15,
    marginHorizontal:15,
    marginBottom:10
  },

  cardHeader:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },

  businessName:{
    color: "#E6F7F3",
    fontSize:16,
    fontWeight:"bold",
    flex:1
  },

  statusBadge:{
    paddingHorizontal:8,
    paddingVertical:3,
    borderRadius:10,
    backgroundColor:"#1C2128"
  },

  status_active:{
    backgroundColor:"#00E676"
  },

  status_pending_payment:{
    backgroundColor:"#FFA000"
  },

  status_paused:{
    backgroundColor:"#999"
  },

  status_ended:{
    backgroundColor:"#777"
  },

  statusBadgeText:{
    color:"#E6F7F3",
    fontSize:11,
    fontWeight:"bold"
  },

  title:{
    color: "#E6F7F3",
    fontSize:14,
    marginTop:6
  },

  meta:{
    fontSize:12,
    color:"#9BA3AE",
    marginTop:4
  },

  statsRow:{
    flexDirection:"row",
    marginTop:8
  },

  stat:{
    fontSize:12,
    color:"#9BA3AE",
    marginRight:15
  },

  actionsRow:{
    flexDirection:"row",
    marginTop:10
  },

  actionBtn:{
    backgroundColor:"#00BFA5",
    paddingHorizontal:12,
    paddingVertical:8,
    borderRadius:8,
    marginRight:8
  },

  actionText:{
    color:"#E6F7F3",
    fontSize:12,
    fontWeight:"bold"
  },

  deleteBtn:{
    paddingHorizontal:12,
    paddingVertical:8
  },

  deleteText:{
    color:"#D32F2F",
    fontSize:12,
    fontWeight:"bold"
  },

  empty:{
    alignItems:"center",
    marginTop:40
  },

  emptyText:{
    color:"#9BA3AE"
  }

});
