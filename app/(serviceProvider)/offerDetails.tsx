import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useLocalSearchParams, router } from "expo-router";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { formatToNepalTime } from "@/utils/formattoNepalTime";
import { getOfferById } from "@/store/slice/serviceOffer";
import { getServiceRequestById } from "@/store/slice/serviceRequest";
import { StartWorkButton } from "@/components/StartButton";
import { useServiceOfferSignalR } from "@/hooks/useServiceOfferSignalR";
import Constants from "expo-constants";

export default function OfferDetails() {
  const { serviceRequestId, offerId } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Redux offer state for real-time updates
  const storeOffer = useSelector((state: RootState) => state.serviceOffer.offers.find((o) => o.id === offerId));

  // Use SignalR
  useServiceOfferSignalR(offer?.serviceProviderId, serviceRequestId as string);

  useEffect(() => {
    if (serviceRequestId && offerId) {
      const fetchData = async () => {
        try {
          setIsLoading(true);

          const requestRes = await dispatch(getServiceRequestById(serviceRequestId as string)).unwrap();
          const offerRes = await dispatch(getOfferById(offerId as string)).unwrap();

          setServiceRequest(requestRes);
          setOffer(offerRes);
        } catch (err) {
          Alert.alert("Error", "Failed to load offer details.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [serviceRequestId, offerId]);

  useEffect(() => {
    if (storeOffer) setOffer(storeOffer);
  }, [storeOffer]);

  if (isLoading || !serviceRequest || !offer) {
    return (
      <View style={styles.container}>
        <Header title="Offer Details" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F63C7" />
        </View>
      </View>
    );
  }

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

  const showStartWorkButton = offer.status === "Accepted";

  return (
    <View style={styles.container}>
      <Header title="Offer Details" showBackButton={true} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Offer Status</Text>
            <View style={[styles.statusBadge, getStatusStyle(offer.status)]}>
              <Text style={[styles.statusText, getStatusTextStyle(offer.status)]}>{offer.status}</Text>
            </View>
          </View>
          <View style={styles.offerTimingContainer}>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Sent</Text>
              <Text style={styles.timingValue}>{formatToNepalTime(offer.sentAt)}</Text>
            </View>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Expires</Text>
              <Text style={styles.timingValue}>{formatToNepalTime(offer.expiresAt)}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Your Price Offer</Text>
            <Text style={styles.priceValue}>NPR {offer.offeredPrice}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{serviceRequest.serviceCategoryName}</Text>
            <View style={[styles.statusBadge, getStatusStyle(serviceRequest.status)]}>
              <Text style={[styles.statusText, getStatusTextStyle(serviceRequest.status)]}>{serviceRequest.status}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Info</Text>
            <Text>{serviceRequest.customerName}</Text>
            <Text>{serviceRequest.customerPhone}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text>{serviceRequest.locationAddress}</Text>
            <Text>{serviceRequest.locationCity}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <Text>{serviceRequest.serviceListNames?.join(", ")}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text>{serviceRequest.description || "No description"}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem Images</Text>
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
        </View>
      </ScrollView>

      {/* <StartWorkButton
        offerId={offerId as string}
        serviceRequestId={serviceRequestId as string}
        onPress={() => {
          router.replace({
            pathname: "/(serviceProvider)/ServiceProviderWorkflow",
            params: {
              offerId: offerId as string,
              serviceRequestId: serviceRequestId as string,
            },
          });
        }}
      /> */}
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
