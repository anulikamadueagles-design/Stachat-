import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import useIsAdmin from "../hooks/useIsAdmin";

export default function ReportsScreen() {

  const isAdmin = useIsAdmin();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReports(list);
    });

    return unsubscribe;
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <View style={styles.denied}>
        <Text style={styles.deniedText}>You don't have access to this page.</Text>
      </View>
    );
  }

  function markReviewed(reportId) {
    updateDoc(doc(db, "reports", reportId), { status: "reviewed" }).catch(() => {});
  }

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <View style={styles.container}>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>{openCount} open report(s)</Text>
      </View>

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <View style={styles.cardHeader}>
              <Text style={styles.type}>
                {item.type === "message" ? "💬 Message report" : "👤 User report"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "open" ? styles.statusOpen : styles.statusReviewed,
                ]}
              >
                <Text style={styles.statusBadgeText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.reason}>{item.reason}</Text>

            {item.context?.details ? (
              <Text style={styles.details}>{item.context.details}</Text>
            ) : null}

            <Text style={styles.meta}>
              Reported user: {item.reportedUid}
            </Text>
            <Text style={styles.meta}>
              Reported by: {item.reporterUid}
            </Text>

            {item.status === "open" ? (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => markReviewed(item.id)}
              >
                <Text style={styles.reviewButtonText}>Mark Reviewed</Text>
              </TouchableOpacity>
            ) : null}

          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reports yet.</Text>
          </View>
        }
      />

    </View>
  );

}

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#0D1117" },

  denied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D1117",
    padding: 20,
  },

  deniedText: { fontSize: 16, color: "#9BA3AE", textAlign: "center" },

  summaryRow: { padding: 15 },

  summaryText: { fontWeight: "bold", color: "#00BFA5" },

  card: {
    backgroundColor: "#12181C",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  type: {
    color: "#E6F7F3", fontWeight: "bold", fontSize: 14 },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  statusOpen: { backgroundColor: "#FFA000" },
  statusReviewed: { backgroundColor: "#999" },

  statusBadgeText: { color: "#E6F7F3", fontSize: 11, fontWeight: "bold" },

  reason: {
    color: "#E6F7F3", fontSize: 14, marginTop: 8, fontWeight: "600" },

  details: { fontSize: 13, color: "#9BA3AE", marginTop: 4 },

  meta: { fontSize: 11, color: "#9BA3AE", marginTop: 6 },

  reviewButton: {
    backgroundColor: "#00BFA5",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  reviewButtonText: { color: "#E6F7F3", fontSize: 12, fontWeight: "bold" },

  empty: { alignItems: "center", marginTop: 40 },

  emptyText: { color: "#9BA3AE" },

});
