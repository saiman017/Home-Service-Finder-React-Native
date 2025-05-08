import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as ExpoLocation from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { googleMapsService } from "@/store/slice/googleMapsService";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  postalCode: string;
}

interface LocationMapProps {
  onLocationSelect: (location: Location) => void;
  initialRegion?: Region;
}

export default function LocationMap({ onLocationSelect, initialRegion }: LocationMapProps) {
  const dispatch = useDispatch<AppDispatch>();
  const mapRef = useRef<MapView | null>(null);
  const locationSubscription = useRef<ExpoLocation.LocationSubscription | null>(null);

  const [region, setRegion] = useState<Region | null>(initialRegion || null);
  const [markerPosition, setMarkerPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialRegion ? { latitude: initialRegion.latitude, longitude: initialRegion.longitude } : null);
  const [address, setAddress] = useState("");
  const [cityAndPostal, setCityAndPostal] = useState({
    city: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(initialRegion ? false : true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Fetch address from coordinates
  const fetchAddressFromCoordinates = useCallback(async (latitude: number, longitude: number) => {
    try {
      setAddressLoading(true);

      const result = await googleMapsService.reverseGeocode(latitude, longitude);

      setAddress(result.address);
      setCityAndPostal({
        city: result.city,
        postalCode: result.postalCode,
      });

      return result;
    } catch (error) {
      console.error("Error fetching address:", error);
      Alert.alert("Error", "Failed to get address for this location");
      return { address: "Unknown location", city: "", postalCode: "" };
    } finally {
      setAddressLoading(false);
    }
  }, []);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    setLocationPermission(granted);

    if (!granted) {
      Alert.alert("Permission Denied", "Enable location permissions in settings");
    }

    return granted;
  }, []);

  // Start location tracking
  const startLocationTracking = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      setLoading(true);

      // Get the current position first
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      setMarkerPosition({ latitude, longitude });

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }

      // Fetch the address for the current position
      await fetchAddressFromCoordinates(latitude, longitude);

      // Now start watching position
      const options = {
        accuracy: ExpoLocation.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      };

      locationSubscription.current = await ExpoLocation.watchPositionAsync(options, async (locationUpdate) => {
        const { latitude: newLat, longitude: newLong } = locationUpdate.coords;
        const updatedRegion = {
          latitude: newLat,
          longitude: newLong,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };

        setRegion(updatedRegion);
        setMarkerPosition({ latitude: newLat, longitude: newLong });

        if (mapRef.current) {
          mapRef.current.animateToRegion(updatedRegion, 500);
        }

        await fetchAddressFromCoordinates(newLat, newLong);
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your current location");
    } finally {
      setLoading(false);
    }
  }, [fetchAddressFromCoordinates, requestLocationPermission]);

  // Cleanup location subscription on unmount
  useEffect(() => {
    if (initialRegion && mapReady) {
      fetchAddressFromCoordinates(initialRegion.latitude, initialRegion.longitude);
    } else if (!initialRegion && mapReady) {
      startLocationTracking();
    }

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [mapReady, initialRegion, startLocationTracking, fetchAddressFromCoordinates]);

  // Handle map ready
  const handleMapReady = () => {
    setMapReady(true);
    if (initialRegion && mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 500);
    }
  };

  // Handle map press to select a location
  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    await fetchAddressFromCoordinates(latitude, longitude);
  };

  // Handle confirm location
  const handleConfirmLocation = async () => {
    if (addressLoading || loading || !markerPosition) return;

    try {
      const newLocation: Location = {
        address: address,
        city: cityAndPostal.city,
        postalCode: cityAndPostal.postalCode,
        latitude: markerPosition.latitude,
        longitude: markerPosition.longitude,
      };

      onLocationSelect(newLocation);
    } catch (error) {
      console.error("Error confirming location:", error);
      Alert.alert("Error", "Failed to save location");
    }
  };

  // Render loading screen if needed
  if (loading && !markerPosition) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F63C7" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView ref={mapRef} style={styles.map} provider={PROVIDER_GOOGLE} initialRegion={region} onPress={handleMapPress} showsUserLocation={locationPermission} onMapReady={handleMapReady}>
          {markerPosition && <Marker coordinate={markerPosition} />}
        </MapView>
      )}

      {/* My Location Button */}
      <TouchableOpacity style={styles.myLocationButton} onPress={startLocationTracking} disabled={!locationPermission}>
        <Ionicons name="location-outline" size={24} color="#3F63C7" />
      </TouchableOpacity>

      {/* Address Container */}
      <View style={styles.addressContainer}>
        <Ionicons name="location" size={20} color="#333" />
        {addressLoading ? (
          <ActivityIndicator size="small" color="#3F63C7" />
        ) : (
          <Text style={styles.addressText} numberOfLines={2}>
            {address || "Select a location"}
          </Text>
        )}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.confirmButton, (addressLoading || !address || !markerPosition) && styles.disabledButton]}
        onPress={handleConfirmLocation}
        disabled={addressLoading || !address || !markerPosition}
      >
        <Text style={styles.confirmButtonText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10 },
  addressContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addressText: { flex: 1, marginLeft: 10 },
  confirmButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#3F63C7",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    elevation: 3,
  },
  disabledButton: { backgroundColor: "#ccc" },
  confirmButtonText: { color: "white", fontWeight: "bold" },
  myLocationButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
