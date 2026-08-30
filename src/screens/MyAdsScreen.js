import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import { AuthContext } from "../context/AuthContext";
import { subscribeMyAds } from "../services/AdService";

const STATUS_LABELS = {
  pending_payment: "Awaiting payment confirmation",
  active: "Live",
  paused: "Paused",
  ended: "Ended",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  pending_payment: "#FFA000",
  active: "#00E676",
  paused: "#9BA3AE",
  ended: "#9BA3AE",
  rejected: "#D32F2F",
};

export default function MyAdsScreen() {

  const { user } = useContext(AuthContext);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    return subscribeMyAds(user.uid, setAds);
  }, [user.uid]);

  return (

    <View style={styles.container}>

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={ads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {

          const ctr =
            item.impressions > 0
              ? ((item.clicks / item.impressions) * 100).toFixed(1)
              : "0.0";

          return (
            <View style={styles.card}>

              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[item.status] || "#9BA3AE" },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {STATUS_LABELS[item.status] || item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.meta}>
                {item.placement} · ${item.amount || 0} {item.currency}
              </Text>

              {item.status === "active" ? (
                <View style={styles.statsRow}>
                  <Text style={styles.stat}>👁️ {item.impressions || 0} views</Text>
                  <Text style={styles.stat}>👆 {item.clicks || 0} clicks</Text>
                  <Text style={styles.stat}>CTR {ctr}%</Text>
                </View>
              ) : null}

              {item.status === "pending_payment" ? (
                <Text style={styles.hint}>
                  We'll activate this once payment is confirmed.
                </Text>
              ) : null}

            </View>
          );

        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              You haven't submitted any ads yet.
            </Text>
          </View>
        }
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#0D1117" },

  card: {
    backgroundColor: "#12181C",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 15, fontWeight: "bold", color: "#E6F7F3", flex: 1 },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },

  statusBadgeText: { color: "#0D1117", fontSize: 11, fontWeight: "bold" },

  meta: { color: "#9BA3AE", fontSize: 12, marginTop: 6 },

  statsRow: { flexDirection: "row", marginTop: 10 },

  stat: { color: "#9BA3AE", fontSize: 12, marginRight: 15 },

  hint: { color: "#9BA3AE", fontSize: 12, marginTop: 8, fontStyle: "italic" },

  empty: { alignItems: "center", marginTop: 60 },

  emptyText: { color: "#9BA3AE", fontSize: 15, textAlign: "center", paddingHorizontal: 30 },

});
