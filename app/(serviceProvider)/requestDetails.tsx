import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useLocalSearchParams, router } from "expo-router";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { formatToNepalTime } from "@/utils/formattoNepalTime";
import { TimeRemainingMinSec } from "@/components/TImeRemainingBanner";
import { sendServiceOffer } from "@/store/slice/serviceOffer";
import { useServiceOfferSignalR } from "@/hooks/useServiceOfferSignalR";
import { getServiceRequestById } from "@/store/slice/serviceRequest";
import Constants from "expo-constants";

export default function CustomerRequestDetails() {
  const { requestId } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [offerPrice, setOfferPrice] = useState("");
  const [isSending, setIsSending] = useState(false);
  const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

  const { pendingRequests } = useSelector((state: RootState) => state.serviceRequest);

  const { userId } = useSelector((state: RootState) => state.auth);
  const { isLoading: offerLoading } = useSelector((state: RootState) => state.serviceOffer);
  const { currentRequest } = useSelector((state: RootState) => state.serviceRequest);

  const { connected } = useServiceOfferSignalR(
    userId as string, // Provider ID
    requestId as string // Request ID
  );
  useEffect(() => {
    const requestIdStr = typeof requestId === "string" ? requestId : requestId?.[0] ?? "";
    if (requestIdStr) {
      dispatch(getServiceRequestById(requestIdStr));
    }
  }, [requestId, dispatch]);
  const requestDetails = currentRequest;

  // const requestDetails = pendingRequests?.find(
  //   (request) => request.id === requestId
  // );
  console.log(requestDetails);

  useEffect(() => {
    console.log("SignalR connection status:", connected);
  }, [connected]);

  const problemImages = requestDetails?.serviceRequestImagePaths || [];

  if (!requestDetails) {
    return (
      <View style={styles.container}>
        <Header title="Request Details" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <Text>Request not found</Text>
        </View>
      </View>
    );
  }
  const handleSendOffer = async () => {
    if (!offerPrice || isNaN(parseFloat(offerPrice))) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }

    setIsSending(true);

    try {
      // Dispatch the send offer action
      const resultAction = await dispatch(
        sendServiceOffer({
          serviceRequestId: requestId as string,
          serviceProviderId: userId as string,
          offeredPrice: parseFloat(offerPrice),
        })
      );

      // Check if the action was fulfilled
      if (sendServiceOffer.fulfilled.match(resultAction)) {
        Alert.alert("Offer Sent", "Your price offer has been sent to the customer", [
          {
            text: "OK",
            onPress: () => router.replace("/(serviceProvider)/(tab)/home"),
          },
        ]);

        // No need to manually refresh data as SignalR will push updates
      } else {
        Alert.alert("Error", "Failed to send offer. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <View style={styles.container}>
      <Header title="Request Details" showBackButton={true} />

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{requestDetails.serviceCategoryName}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{requestDetails.status}</Text>
            </View>
          </View>

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color="#666" />
              <Text style={styles.detailText}>{requestDetails.customerName || "Customer name not available"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={18} color="#666" />
              <Text style={styles.detailText}>{requestDetails.customerName || "Phone not available"}</Text>
            </View>
          </View>
          {/* Location Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.detailText}>{requestDetails.locationAddress}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={18} color="#666" />
              <Text style={styles.detailText}>{requestDetails.locationCity}</Text>
            </View>
          </View>
          {/* Service Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="list-outline" size={18} color="#666" />
              <Text style={styles.detailText}>Services: {requestDetails.serviceListNames?.join(", ")}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.detailText}>Created: {formatToNepalTime(requestDetails.createdAt)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="alarm-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                Expires After: <TimeRemainingMinSec expiresAt={requestDetails.expiresAt} />
              </Text>
            </View>
          </View>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{requestDetails.description || "No description provided"}</Text>
          </View>
          {/* Problem Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {problemImages.length > 0 ? (
                problemImages.map((imageUri, index) => <Image key={imageUri} source={{ uri: `${IMAGE_API_URL}${imageUri}` }} style={styles.problemImage} resizeMode="cover" />)
              ) : (
                <Text style={{ color: "#999" }}>No images uploaded</Text>
              )}
            </ScrollView>
          </View>

          {/* Price Offer Section */}
          <View style={styles.offerSection}>
            <Text style={styles.sectionTitle}>Send Price Offer</Text>
            <Text style={styles.offerInstructions}>Please specify your price to complete this service</Text>

            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>NPR</Text>
              <TextInput style={styles.priceInput} value={offerPrice} onChangeText={setOfferPrice} placeholder="Enter your price" keyboardType="numeric" placeholderTextColor="#999" />
            </View>

            <TouchableOpacity style={styles.sendOfferButton} onPress={handleSendOffer} disabled={isSending || offerLoading}>
              {isSending || offerLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendOfferButtonText}>Send Offer</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles would be here

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
    // borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,

    shadowColor: "#FEFEFE",
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
  offerSection: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
  },
  offerInstructions: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendOfferButton: {
    backgroundColor: "#3F63C7",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendOfferButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
