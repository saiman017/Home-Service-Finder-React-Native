import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getRequestsByCategory } from "@/store/slice/serviceRequest";
import { fetchServiceProviderById } from "@/store/slice/serviceProvider";
import Header from "@/components/Header";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Define interfaces for type safety
interface ServiceRequest {
  id: string;
  serviceCategory: string;
  serviceCategoryId: string;

  status: string;
  address: string;
  createdAt: string;
  serviceListNames: string[];
  description: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export default function CustomerRequest() {
  const dispatch = useDispatch<AppDispatch>();
  const { requestsByCategory, isLoading: requestsLoading } = useSelector(
    (state: RootState) => state.serviceRequest
  );
  // Fix: correctly access serviceProvider state
  const { selectedProvider, isLoading: providerLoading } = useSelector(
    (state: RootState) => state.serviceProvider
  );

  console.log("dfsf", selectedProvider);
  const { userId, role } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Load provider details on component mount
  useEffect(() => {
    if (role === "serviceProvider" && userId) {
      dispatch(fetchServiceProviderById(userId));
    }
  }, [dispatch, userId, role]);

  // Set the category ID when provider details are loaded
  useEffect(() => {
    if (selectedProvider && selectedProvider.serviceCategoryId) {
      setCategoryId(selectedProvider.serviceCategoryId);
      loadRequests(selectedProvider.serviceCategoryId);
    }
  }, [selectedProvider]);

  const loadRequests = async (catId: string) => {
    dispatch(getRequestsByCategory(catId));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (categoryId) {
      await dispatch(getRequestsByCategory(categoryId));
    }
    setRefreshing(false);
  };

  console.log(categoryId);

  const handleViewDetails = (requestId: string) => {
    // router.push(`/(serviceProvider)/requestDetails/${requestId}`);
  };

  const renderRequestItem = ({ item }: { item: ServiceRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>
          {item.serviceCategory || "Service Request"}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status || "NEW"}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.address || "Location not specified"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.createdAt).toLocaleDateString() ||
              "Date not available"}
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F8C52B" />
        </View>
      ) : categoryId ? (
        requestsByCategory && requestsByCategory.length > 0 ? (
          <FlatList
            data={requestsByCategory}
            renderItem={renderRequestItem}
            keyExtractor={(item: ServiceRequest) => item.id}
            contentContainerStyle={styles.requestsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>
                  Available Service Requests
                </Text>
              </View>
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
    backgroundColor: "#F8C52B",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewButtonText: {
    fontWeight: "600",
    color: "#000",
  },
});
