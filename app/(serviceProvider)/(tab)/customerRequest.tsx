import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getPendingRequestsByCategory } from "@/store/slice/serviceRequest";
import { fetchServiceProviderById } from "@/store/slice/serviceProvider";
import Header from "@/components/Header";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatToNepalTime } from "@/utils/formattoNepalTime";
import { useServiceRequestSignalR } from "@/hooks/useServiceRequestSignalR";

export default function CustomerRequest() {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingRequests, isLoading: requestsLoading } = useSelector(
    (state: RootState) => state.serviceRequest
  );
  const { selectedProvider, isLoading: providerLoading } = useSelector(
    (state: RootState) => state.serviceProvider
  );
  const { requestsWithOffers } = useSelector(
    (state: RootState) => state.serviceOffer
  );
  const { userId, role, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [refreshing, setRefreshing] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { connected: signalRConnected, connectionError } =
    useServiceRequestSignalR(categoryId || undefined);

  useEffect(() => {
    if (connectionError) {
      Alert.alert(
        "Connection Issue",
        "Real-time updates may be delayed. Please check your internet connection."
      );
    }
  }, [connectionError]);

  useEffect(() => {
    if (role === "serviceProvider" && userId && isAuthenticated) {
      dispatch(fetchServiceProviderById(userId));
    }
  }, [dispatch, userId, role, isAuthenticated]);

  useEffect(() => {
    if (selectedProvider?.serviceCategoryId) {
      const catId = selectedProvider.serviceCategoryId;
      setCategoryId(catId);
      if (!signalRConnected) {
        dispatch(getPendingRequestsByCategory(catId));
      }
    }
  }, [selectedProvider, signalRConnected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (userId && role === "serviceProvider") {
      const result = await dispatch(fetchServiceProviderById(userId));
      const newCatId = result?.payload?.serviceCategoryId;
      if (newCatId) {
        setCategoryId(newCatId);
        if (!signalRConnected) {
          await dispatch(getPendingRequestsByCategory(newCatId));
        }
      }
    }
    setRefreshing(false);
  }, [dispatch, userId, role, signalRConnected]);

  const filteredRequests = useMemo(() => {
    return pendingRequests?.filter(
      (req) =>
        !requestsWithOffers.includes(req.id) &&
        req.status !== "Cancelled" &&
        req.status !== "Expired"
    );
  }, [pendingRequests, requestsWithOffers]);

  const handleViewDetails = (requestId: string) => {
    router.push({
      pathname: "/(serviceProvider)/requestDetails",
      params: { requestId },
    });
  };

  const renderRequestItem = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>
          {item.serviceCategoryName || "Service Request"}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status || "NEW"}</Text>
        </View>
      </View>
      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.locationAddress || "Location not specified"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatToNepalTime(item.createdAt) || "Date not available"}
          </Text>
        </View>
        <View style={styles.servicesList}>
          <Text style={styles.servicesLabel}>Services: </Text>
          <Text style={styles.servicesText}>
            {item.serviceListNames?.join(", ") || "No services specified"}
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

  const isLoading = providerLoading || requestsLoading;

  return (
    <View style={styles.container}>
      <Header title="Customer Requests" showBackButton={true} />
      {categoryId && (
        <View
          style={[
            styles.connectionIndicator,
            { backgroundColor: signalRConnected ? "#E8F5E9" : "#ffeeee" },
          ]}
        >
          <Ionicons
            name={
              signalRConnected ? "checkmark-circle-outline" : "wifi-outline"
            }
            size={16}
            color={signalRConnected ? "#2E7D32" : "#777"}
          />
          <Text
            style={[
              styles.connectionText,
              { color: signalRConnected ? "#2E7D32" : "#777" },
            ]}
          >
            {signalRConnected
              ? "Real-time updates enabled"
              : "Using periodic updates"}
          </Text>
        </View>
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F63C7" />
        </View>
      ) : categoryId ? (
        filteredRequests && filteredRequests.length > 0 ? (
          <FlatList
            data={filteredRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.requestsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isLoading}
                onRefresh={onRefresh}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#999" />
            <Text style={styles.emptyText}>
              No requests available for your service category
            </Text>
          </View>
        )
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#999" />
          <Text style={styles.emptyText}>
            Unable to load your service category
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
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  requestsList: {
    padding: 15,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "500",
  },
  requestDetails: {
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
  servicesList: {
    marginTop: 4,
  },
  servicesLabel: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  servicesText: {
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
  connectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 6,
  },
  connectionText: {
    fontSize: 12,
    marginLeft: 5,
  },
});
