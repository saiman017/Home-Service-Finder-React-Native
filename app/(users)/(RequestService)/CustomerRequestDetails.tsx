import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as ExpoLocation from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getServiceRequestById } from "@/store/slice/serviceRequest";

import { getOfferById } from "@/store/slice/serviceOffer";

const GOOGLE_MAPS_API_KEY = "AIzaSyB8s9qKa8kx8AHQU3dXK3xbbKiMCxwNR9Q";

export default function CustomerRequestDetails() {
  const { offerId, serviceRequestId } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [duration, setDuration] = useState<string>("Calculating...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (offerId) {
          const offerResponse = await dispatch(
            getOfferById(offerId as string)
          ).unwrap();
          setOfferDetails(offerResponse);
        }
        if (serviceRequestId) {
          const requestResponse = await dispatch(
            getServiceRequestById(serviceRequestId as string)
          ).unwrap();
          setServiceRequest(requestResponse);
        }
        await requestLocationAndCalculateRoute();
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load required information.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [offerId, serviceRequestId, dispatch]);

  const requestLocationAndCalculateRoute = async () => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to show distance to service provider."
      );
      return;
    }
    try {
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      if (
        serviceRequest &&
        serviceRequest.locationLatitude &&
        serviceRequest.locationLongitude
      ) {
        calculateDetailedRoute(latitude, longitude);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your current location");
    }
  };

  const calculateDetailedRoute = async (startLat: number, startLng: number) => {
    if (
      !serviceRequest ||
      !serviceRequest.locationLatitude ||
      !serviceRequest.locationLongitude
    ) {
      return;
    }
    try {
      // Simulate fetching route info from Google Maps API
      const result = {
        distanceMatrix: {
          distance: "5.0 km",
          duration: "10.5 mins",
        },
        polyline: [
          { latitude: startLat, longitude: startLng },
          {
            latitude: serviceRequest.locationLatitude,
            longitude: serviceRequest.locationLongitude,
          },
        ],
      };

      setDistance(result.distanceMatrix.distance);
      setDuration(result.distanceMatrix.duration);

      if (mapRef.current && result.polyline.length > 0) {
        mapRef.current.fitToCoordinates(result.polyline, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      setDistance("Unavailable");
      setDuration("Unavailable");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F63C7" />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: currentLocation?.latitude || 0,
            longitude: currentLocation?.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
            >
              <View style={styles.originMarker}>
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}
          {serviceRequest && (
            <Marker
              coordinate={{
                latitude: serviceRequest.locationLatitude,
                longitude: serviceRequest.locationLongitude,
              }}
              title="Service Provider Location"
            >
              <View style={styles.destinationMarker}>
                <Ionicons name="location" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          )}
          <MapViewDirections
            origin={{
              latitude: currentLocation?.latitude || 0,
              longitude: currentLocation?.longitude || 0,
            }}
            destination={{
              latitude: serviceRequest?.locationLatitude || 0,
              longitude: serviceRequest?.locationLongitude || 0,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#FF3B30"
            onReady={(result) => {
              setDistance(`${result.distance.toFixed(2)} km`);
              setDuration(`${result.duration.toFixed(1)} mins`);
            }}
          />
        </MapView>
      </View>

      {/* Service Provider Details Section */}
      <ScrollView style={styles.infoPanel}>
        <View style={styles.headerSection}>
          <Text style={styles.heading}>Service Provider Details</Text>
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate" size={20} color="#3F63C7" />
            <Text style={styles.distanceText}>
              {distance} ({duration})
            </Text>
          </View>
        </View>

        <View style={styles.providerDetailsContainer}>
          <Image
            source={{ uri: offerDetails?.providerProfileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.providerName}>{offerDetails?.providerName}</Text>
          <Text style={styles.contactNumber}>
            Contact: {offerDetails?.contactNumber}
          </Text>
        </View>

        {/* Service Request Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Selected Services</Text>
          <Text style={styles.value}>
            {serviceRequest?.serviceListNames?.join(", ") || "N/A"}
          </Text>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>
            {serviceRequest?.description || "No additional details provided"}
          </Text>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>
            {serviceRequest?.locationAddress || "N/A"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#808080",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  distanceText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#3F63C7",
    fontWeight: "500",
  },
  providerDetailsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  contactNumber: {
    fontSize: 14,
    color: "#808080",
  },
  detailsContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 12,
  },
  originMarker: {
    backgroundColor: "#3F63C7",
    borderRadius: 18,
    padding: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  destinationMarker: {
    backgroundColor: "#FF3B30",
    borderRadius: 18,
    padding: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
