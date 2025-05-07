import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { resetServiceRequestState, clearServiceRequestData } from "@/store/slice/serviceRequest";
import { fetchServiceProviderById } from "@/store/slice/serviceProvider";
import { AppDispatch, RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

interface ServiceOffer {
  id: string;
  serviceProviderId: string;
  providerName?: string;
  offeredPrice: number;
  status: string;
  // ... other properties
}

interface OfferNotificationProps {
  serviceOfferData: ServiceOffer;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
}

const PANEL_MIN_HEIGHT = 80;
const DEFAULT_PROFILE_IMAGE = require("@/assets/images/electrician.png");

const OfferNotification: React.FC<OfferNotificationProps> = ({ serviceOfferData, onAccept, onDecline }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { id, providerName, offeredPrice, serviceProviderId } = serviceOfferData;
  const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

  const selectedProvider = useSelector((state: RootState) => state.serviceProvider.selectedProvider);
  const loadingProvider = useSelector((state: RootState) => state.serviceProvider.isLoading);

  // Static rating for now - can be replaced with dynamic data later
  const providerRating = 4.7;

  useEffect(() => {
    if (serviceProviderId && !selectedProvider) {
      setIsLoading(true);
      dispatch(fetchServiceProviderById(serviceProviderId)).finally(() => setIsLoading(false));
    }
  }, [serviceProviderId, dispatch]);

  if (!isVisible || serviceOfferData.status !== "Pending") {
    return null;
  }

  const handleAccept = () => {
    setIsVisible(false);
    onAccept(id);
    // Navigate to home page after accepting
    setTimeout(() => {
      dispatch(resetServiceRequestState());
      dispatch(clearServiceRequestData());
      router.replace("/(tabs)/home");
    }, 1000);
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline(id);
  };

  // Get profile picture URL if available
  const getProfilePicture = () => {
    if (selectedProvider?.profilePicture) {
      return { uri: `${IMAGE_API_URL}${selectedProvider.profilePicture}` };
    }
    return DEFAULT_PROFILE_IMAGE;
  };

  // Display the name from the provider data if available, otherwise use the one from the offer
  const displayName = selectedProvider?.firstName && selectedProvider?.lastName ? `${selectedProvider.firstName} ${selectedProvider.lastName}` : providerName || "Service Provider";

  return (
    <View style={styles.container}>
      <View style={styles.notificationCard}>
        {/* Provider Basic Info */}
        <View style={styles.providerInfo}>
          <View style={styles.profileImageContainer}>
            {isLoading || loadingProvider ? <ActivityIndicator size="small" color="#3F63C7" /> : <Image source={getProfilePicture()} style={styles.profileImage} />}
          </View>
          <View style={styles.nameRatingContainer}>
            <Text style={styles.providerName}>{displayName}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{providerRating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currencySymbol}>NPR</Text>
          <Text style={styles.price}>{offeredPrice}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: PANEL_MIN_HEIGHT + 600,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  notificationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  nameRatingContainer: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginRight: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  declineButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 8,
  },
  declineText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  acceptButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#3F63C7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OfferNotification;
