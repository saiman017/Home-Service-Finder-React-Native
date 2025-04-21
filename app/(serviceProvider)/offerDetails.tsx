import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useLocalSearchParams, router } from "expo-router";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { formatToNepalTime } from "@/utils/formattoNepalTime";
import { getOfferById } from "@/store/slice/serviceOffer";

import { getServiceRequestById } from "@/store/slice/serviceRequest";

import { StartWorkButton } from "@/components/StartButton";

export default function OfferDetails() {
  const { serviceRequestId, offerId } = useLocalSearchParams();
  console.log();
  const dispatch = useDispatch<AppDispatch>();

  // Local state to store fetched data
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [offers, setOffers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const showStartWorkButton = offers && offers.status === "Accepted";

  // Fetch service request and offers on component mount
  useEffect(() => {
    if (serviceRequestId) {
      const fetchDetails = async () => {
        try {
          setIsLoading(true);

          // Fetch service request details
          const requestResponse = await dispatch(
            getServiceRequestById(serviceRequestId as string)
          ).unwrap();
          setServiceRequest(requestResponse);

          // Fetch offers for the service request
          const offersResponse = await dispatch(
            getOfferById(offerId as string)
          ).unwrap();
          setOffers(offersResponse);
        } catch (error) {
          console.error("Error fetching data:", error);
          Alert.alert("Error", "Failed to load offer details.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    }
  }, [serviceRequestId, dispatch]);

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Offer Details" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F63C7" />
        </View>
      </View>
    );
  }

  // Handle case where no data is found
  if (!serviceRequest || !offers || offers.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Offer Details" showBackButton={true} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#999" />
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  console.log("Offer Status:", offers?.status);
  console.log("Request Status:", serviceRequest?.status);

  // Extract request details
  const requestDetails = serviceRequest;

  // Function to get appropriate status style
  // Function to get appropriate status style
  const getStatusStyle = (status?: string) => {
    if (!status) return styles.statusPending;
    switch (status.toLowerCase()) {
      case "accepted":
        return styles.statusAccepted;
      case "rejected":
        return styles.statusRejected;
      case "expired":
        return styles.statusExpired;
      default:
        return styles.statusPending;
    }
  };

  // Function to get appropriate status text style
  const getStatusTextStyle = (status?: string) => {
    if (!status) return styles.statusTextPending;
    switch (status.toLowerCase()) {
      case "accepted":
        return styles.statusTextAccepted;
      case "rejected":
        return styles.statusTextRejected;
      case "expired":
        return styles.statusTextExpired;
      default:
        return styles.statusTextPending;
    }
  };

  console.log("dfsd", serviceRequest);
  console.log("offer", offers);

  // console.log(off)

  return (
    <View style={styles.container}>
      <Header title="Offer Details" showBackButton={true} />
      <ScrollView style={styles.scrollContainer}>
        {/* Offer Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Offer Status</Text>
            <View style={[styles.statusBadge, getStatusStyle(offers.status)]}>
              <Text
                style={[styles.statusText, getStatusTextStyle(offers.status)]}
              >
                {serviceRequest.status}
              </Text>
            </View>
          </View>
          <View style={styles.offerTimingContainer}>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Sent</Text>
              <Text style={styles.timingValue}>
                {formatToNepalTime(offers.sentAt)}
              </Text>
            </View>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Expires</Text>
              <Text style={styles.timingValue}>
                {formatToNepalTime(offers.expiresAt)}
              </Text>
            </View>
            {offers.status === "Pending" && (
              <View style={styles.timingItem}>
                <Text style={styles.timingLabel}>Time Remaining</Text>
                <Text style={styles.timingValue}></Text>
              </View>
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Your Price Offer</Text>
            <Text style={styles.priceValue}>NPR {offers.offeredPrice}</Text>
          </View>
        </View>

        {/* Service Request Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {requestDetails.serviceCategoryName || "Service Request"}
            </Text>
            <View
              style={[
                styles.statusBadge,
                getStatusStyle(requestDetails.status),
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  getStatusTextStyle(requestDetails.status),
                ]}
              >
                {requestDetails.status || "Pending"}
              </Text>
            </View>
          </View>

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {requestDetails.customerName || "Customer name not available"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {requestDetails.customerPhone || "Phone not available"}
              </Text>
            </View>
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {requestDetails.locationAddress || "Address not available"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {requestDetails.locationCity || "City not available"}
              </Text>
            </View>
          </View>

          {/* Service Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="list-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                Services:{" "}
                {requestDetails.serviceListNames?.join(", ") || "Not specified"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                Created: {formatToNepalTime(requestDetails.createdAt || "")}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {requestDetails.description || "No description provided"}
            </Text>
          </View>

          {/* Problem Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem Images</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}
            >
              {problemImages.map((image, index) => (
                <Image
                  key={index}
                  source={image}
                  style={styles.problemImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
      {showStartWorkButton && (
        <StartWorkButton
          offerId={offerId as string}
          serviceRequestId={serviceRequestId as string}
        />
      )}
    </View>
  );
}

// Mock images for demonstration
const problemImages = [
  require("@/assets/images/electrician.png"),
  require("@/assets/images/electrician.png"),
];

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
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: "#FEFEFE",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusCard: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: "#FEFEFE",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  offerTimingContainer: {
    marginBottom: 16,
  },
  timingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timingLabel: {
    fontSize: 14,
    color: "#666",
  },
  timingValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  priceContainer: {
    backgroundColor: "#f8f8f8",
    padding: 14,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3e9c35",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
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
  statusPending: {
    backgroundColor: "#FFF8E1",
  },
  statusTextPending: {
    color: "#F57F17",
  },
  statusAccepted: {
    backgroundColor: "#E8F5E9",
  },
  statusTextAccepted: {
    color: "#2E7D32",
  },
  statusRejected: {
    backgroundColor: "#FFEBEE",
  },
  statusTextRejected: {
    color: "#C62828",
  },
  statusExpired: {
    backgroundColor: "#ECEFF1",
  },
  statusTextExpired: {
    color: "#546E7A",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
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
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  imagesContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  problemImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
});
