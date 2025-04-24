import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getRequestsByCustomerId } from "@/store/slice/serviceRequest";
import Header from "@/components/Header";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatToNepalTime } from "@/utils/formattoNepalTime";

export default function History() {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useSelector((state: RootState) => state.auth);
  const { customerRequests, isLoading } = useSelector(
    (state: RootState) => state.serviceRequest
  );

  // Filter for completed and expired requests only
  const historyRequests = customerRequests.filter(
    (request) => request.status === "Completed" || request.status === "Expired"
  );

  useEffect(() => {
    if (userId) {
      dispatch(getRequestsByCustomerId(userId));
    }
  }, [userId, dispatch]);

  const handleViewDetails = (serviceRequestId: string) => {
    router.push({
      pathname: "/(users)/historyDetail",
      params: { serviceRequestId },
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return styles.statusAccepted;
      case "expired":
        return styles.statusExpired;
      default:
        return styles.statusPending;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return styles.statusTextAccepted;
      case "expired":
        return styles.statusTextExpired;
      default:
        return styles.statusTextPending;
    }
  };

  const renderRequestItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.offerCard}>
        <View style={styles.offerHeader}>
          <Text style={styles.offerTitle}>
            {item.serviceCategoryName || "Service Request"}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.offerDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.locationAddress || "Location not specified"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.serviceListNames?.join(", ") || "No services listed"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Created: {formatToNepalTime(item.createdAt)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDetails(item.id)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Service History" showBackButton={true} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F63C7" />
        </View>
      ) : historyRequests && historyRequests.length > 0 ? (
        <FlatList
          data={historyRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.offersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color="#999" />
          <Text style={styles.emptyText}>
            You don't have any completed service requests yet
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  offersList: {
    padding: 15,
  },
  offerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: "#FFF9C4",
  },
  statusAccepted: {
    backgroundColor: "#E8F5E9",
  },
  statusRejected: {
    backgroundColor: "#FFEBEE",
  },
  statusExpired: {
    backgroundColor: "#ECEFF1",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextPending: {
    color: "#F57F17",
  },
  statusTextAccepted: {
    color: "#2E7D32",
  },
  statusTextRejected: {
    color: "#C62828",
  },
  statusTextExpired: {
    color: "#546E7A",
  },
  offerDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: "#3F63C7",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewButtonText: {
    fontWeight: "600",
    color: "#ffffff",
  },
});
