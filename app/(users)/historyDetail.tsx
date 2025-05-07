import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { formatToNepalTime } from "@/utils/formattoNepalTime";
import { getServiceRequestById } from "@/store/slice/serviceRequest";
import { getOffersByRequestId } from "@/store/slice/serviceOffer";
import Constants from "expo-constants";

export default function HistoryDetail() {
  const { serviceRequestId } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [offerDetails, setOfferDetails] = useState<any>(null);

  useEffect(() => {
    if (serviceRequestId) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const requestRes = await dispatch(getServiceRequestById(serviceRequestId as string)).unwrap();
          setServiceRequest(requestRes);

          // If request completed, fetch offer
          if (requestRes.status === "Completed") {
            const offers = await dispatch(getOffersByRequestId(serviceRequestId as string)).unwrap();
            const acceptedOffer = offers.find((offer: any) => offer.status === "Completed");
            setOfferDetails(acceptedOffer);
          }
        } catch (err) {
          Alert.alert("Error", "Failed to load service request details.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [serviceRequestId]);

  if (isLoading || !serviceRequest) {
    return (
      <View style={styles.container}>
        <Header title="Request Details" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F63C7" />
        </View>
      </View>
    );
  }

  const getStatusStyle = (status?: string) => {
    if (!status) return styles.statusPending;
    switch (status.toLowerCase()) {
      case "completed":
        return styles.statusAccepted;
      case "expired":
        return styles.statusExpired;
      default:
        return styles.statusPending;
    }
  };

  const getStatusTextStyle = (status?: string) => {
    if (!status) return styles.statusTextPending;
    switch (status.toLowerCase()) {
      case "completed":
        return styles.statusTextAccepted;
      case "expired":
        return styles.statusTextExpired;
      default:
        return styles.statusTextPending;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Service History Detail" showBackButton={true} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{serviceRequest.serviceCategoryName}</Text>
            <View style={[styles.statusBadge, getStatusStyle(serviceRequest.status)]}>
              <Text style={[styles.statusText, getStatusTextStyle(serviceRequest.status)]}>{serviceRequest.status}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Timeline</Text>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>Created: {formatToNepalTime(serviceRequest.createdAt)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>Expired: {formatToNepalTime(serviceRequest.expiresAt)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{serviceRequest.locationAddress}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{serviceRequest.locationCity}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{serviceRequest.locationPostalCode}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services Requested</Text>
            {serviceRequest.serviceListNames &&
              serviceRequest.serviceListNames.map((service: string, index: number) => (
                <View key={index} style={styles.detailRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{service}</Text>
                </View>
              ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{serviceRequest.description || "No description provided"}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {serviceRequest.serviceRequestImagePaths && serviceRequest.serviceRequestImagePaths.length > 0 ? (
                serviceRequest.serviceRequestImagePaths.map((imageUri: string, index: number) => (
                  <Image key={index} source={{ uri: `${IMAGE_API_URL}${imageUri}` }} style={styles.problemImage} resizeMode="cover" />
                ))
              ) : (
                <Text style={{ color: "#999" }}>No images uploaded</Text>
              )}
            </ScrollView>
          </View>
          {serviceRequest.status === "Completed" && offerDetails && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Provider Details</Text>
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.detailText}>Provider: {offerDetails.providerName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="pricetag-outline" size={16} color="#666" />
                <Text style={styles.detailText}>Price: NPR {offerDetails.offeredPrice}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.detailText}>Sent At: {formatToNepalTime(offerDetails.sentAt)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    flex: 1, //
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusPending: {
    backgroundColor: "#FFF9C4",
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
