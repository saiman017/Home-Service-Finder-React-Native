// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   View,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Platform,
// } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
// import * as ExpoLocation from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store/store";
// import { setCurrentLocation, reverseGeocode } from "@/store/slice/location";

// interface Location {
//   latitude: number;
//   longitude: number;
//   address: string;
//   city: string;
//   postalCode: string;
// }

// interface LocationMapProps {
//   onLocationSelect: (location: Location) => void;
//   initialRegion?: Region;
// }

// export default function LocationMap({
//   onLocationSelect,
//   initialRegion,
// }: LocationMapProps) {
//   const dispatch = useDispatch<AppDispatch>();
//   const mapRef = useRef<MapView | null>(null);
//   const locationSubscription = useRef<ExpoLocation.LocationSubscription | null>(
//     null
//   );

//   const [region, setRegion] = useState<Region | null>(initialRegion || null);
//   const [markerPosition, setMarkerPosition] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(
//     initialRegion
//       ? { latitude: initialRegion.latitude, longitude: initialRegion.longitude }
//       : null
//   );
//   const [address, setAddress] = useState("");
//   const [loading, setLoading] = useState(initialRegion ? false : true);
//   const [addressLoading, setAddressLoading] = useState(false);
//   const [locationPermission, setLocationPermission] = useState(false);
//   const [mapReady, setMapReady] = useState(false);

//   const fetchAddressFromCoordinates = useCallback(
//     async (latitude: number, longitude: number) => {
//       try {
//         setAddressLoading(true);
//         const result = await dispatch(reverseGeocode({ latitude, longitude }));

//         if (reverseGeocode.fulfilled.match(result)) {
//           const { address: addressText, city, postalCode } = result.payload;
//           setAddress(addressText);
//           return { address: addressText, city, postalCode };
//         }

//         return { address: "Unknown location", city: "", postalCode: "" };
//       } catch (error) {
//         console.error("Error fetching address:", error);
//         Alert.alert("Error", "Failed to get address for this location");
//         return { address: "Unknown location", city: "", postalCode: "" };
//       } finally {
//         setAddressLoading(false);
//       }
//     },
//     [dispatch]
//   );

//   const requestLocationPermission = useCallback(async () => {
//     const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
//     const granted = status === "granted";
//     setLocationPermission(granted);

//     if (!granted) {
//       Alert.alert(
//         "Permission Denied",
//         "Enable location permissions in settings"
//       );
//     }

//     return granted;
//   }, []);

//   const startLocationTracking = useCallback(async () => {
//     const hasPermission = await requestLocationPermission();
//     if (!hasPermission) return;

//     const options = {
//       accuracy: ExpoLocation.Accuracy.High,
//       timeInterval: 5000,
//       distanceInterval: 10,
//     };

//     locationSubscription.current = await ExpoLocation.watchPositionAsync(
//       options,
//       async (location) => {
//         const { latitude, longitude } = location.coords;
//         const newRegion = {
//           latitude,
//           longitude,
//           latitudeDelta: 0.005,
//           longitudeDelta: 0.005,
//         };

//         setRegion(newRegion);
//         setMarkerPosition({ latitude, longitude });
//         mapRef.current?.animateToRegion(newRegion, 500);
//         await fetchAddressFromCoordinates(latitude, longitude);
//       }
//     );
//   }, [fetchAddressFromCoordinates, requestLocationPermission]);

//   useEffect(() => {
//     if (!initialRegion && mapReady) {
//       startLocationTracking();
//     }

//     return () => {
//       locationSubscription.current?.remove();
//     };
//   }, [mapReady, initialRegion, startLocationTracking]);

//   const handleMapReady = () => {
//     setMapReady(true);
//     if (initialRegion && mapRef.current) {
//       mapRef.current.animateToRegion(initialRegion, 500);
//     }
//   };

//   const handleMapPress = async (e: any) => {
//     const { latitude, longitude } = e.nativeEvent.coordinate;
//     setMarkerPosition({ latitude, longitude });
//     await fetchAddressFromCoordinates(latitude, longitude);
//   };

//   const handleConfirmLocation = async () => {
//     if (addressLoading || loading || !markerPosition) return;

//     try {
//       const locationData = await fetchAddressFromCoordinates(
//         markerPosition.latitude,
//         markerPosition.longitude
//       );

//       const newLocation: Location = {
//         address: locationData.address,
//         city: locationData.city,
//         postalCode: locationData.postalCode,
//         latitude: markerPosition.latitude,
//         longitude: markerPosition.longitude,
//       };

//       dispatch(setCurrentLocation(newLocation));
//       onLocationSelect(newLocation);
//     } catch (error) {
//       console.error("Error confirming location:", error);
//       Alert.alert("Error", "Failed to save location");
//     }
//   };

//   if (loading && !markerPosition) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#F8C52B" />
//         <Text style={styles.loadingText}>Getting your location...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {region && (
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           provider={PROVIDER_GOOGLE}
//           initialRegion={region}
//           onPress={handleMapPress}
//           showsUserLocation={locationPermission}
//           onMapReady={handleMapReady}
//         >
//           {markerPosition && <Marker coordinate={markerPosition} />}
//         </MapView>
//       )}

//       <View style={styles.addressContainer}>
//         <Ionicons name="location" size={20} color="#333" />
//         {addressLoading ? (
//           <ActivityIndicator size="small" color="#F8C52B" />
//         ) : (
//           <Text style={styles.addressText} numberOfLines={2}>
//             {address || "Select a location"}
//           </Text>
//         )}
//       </View>

//       <TouchableOpacity
//         style={[
//           styles.confirmButton,
//           (addressLoading || !address || !markerPosition) &&
//             styles.disabledButton,
//         ]}
//         onPress={handleConfirmLocation}
//         disabled={addressLoading || !address || !markerPosition}
//       >
//         <Text style={styles.confirmButtonText}>Confirm Location</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

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

//

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   View,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Platform,
// } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
// import * as ExpoLocation from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store/store";
// import { setCurrentLocation, reverseGeocode } from "@/store/slice/location";

// interface Location {
//   latitude: number;
//   longitude: number;
//   address: string;
//   city: string;
//   postalCode: string;
// }

// interface LocationMapProps {
//   onLocationSelect: (location: Location) => void;
//   initialRegion?: Region;
// }

// export default function LocationMap({
//   onLocationSelect,
//   initialRegion,
// }: LocationMapProps) {
//   const dispatch = useDispatch<AppDispatch>();
//   const mapRef = useRef<MapView | null>(null);
//   const [region, setRegion] = useState<Region | null>(initialRegion || null);
//   const [markerPosition, setMarkerPosition] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(
//     initialRegion
//       ? {
//           latitude: initialRegion.latitude,
//           longitude: initialRegion.longitude,
//         }
//       : null
//   );
//   const [address, setAddress] = useState("");
//   const [loading, setLoading] = useState(initialRegion ? false : true);
//   const [addressLoading, setAddressLoading] = useState(false);
//   const [locationPermission, setLocationPermission] = useState(false);
//   const [mapReady, setMapReady] = useState(false);
//   const isGettingLocationRef = useRef(false);
//   const watchIdRef = useRef<ExpoLocation.LocationSubscription | null>(null);

//   const fetchAddressFromCoordinates = useCallback(
//     async (latitude: number, longitude: number) => {
//       try {
//         setAddressLoading(true);
//         const result = await dispatch(reverseGeocode({ latitude, longitude }));

//         if (reverseGeocode.fulfilled.match(result)) {
//           const { address: addressText, city, postalCode } = result.payload;
//           setAddress(addressText);
//           return { address: addressText, city, postalCode };
//         }

//         return {
//           address: "Unknown location",
//           city: "",
//           postalCode: "",
//         };
//       } catch (error) {
//         console.error("Error fetching address:", error);
//         Alert.alert("Error", "Failed to get address for this location");
//         return {
//           address: "Unknown location",
//           city: "",
//           postalCode: "",
//         };
//       } finally {
//         setAddressLoading(false);
//       }
//     },
//     [dispatch]
//   );

//   const requestLocationPermission = useCallback(async () => {
//     try {
//       const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
//       const hasPermission = status === "granted";
//       setLocationPermission(hasPermission);

//       if (!hasPermission) {
//         Alert.alert(
//           "Permission Denied",
//           "Please enable location permissions in settings",
//           [{ text: "OK" }]
//         );
//       }

//       return hasPermission;
//     } catch (error) {
//       console.error("Error requesting location permission:", error);
//       return false;
//     }
//   }, []);

//   const getCurrentLocation = useCallback(async () => {
//     if (isGettingLocationRef.current) return;
//     isGettingLocationRef.current = true;

//     try {
//       setLoading(true);
//       const hasPermission = await requestLocationPermission();
//       if (!hasPermission) {
//         setLoading(false);
//         isGettingLocationRef.current = false;
//         return;
//       }

//       const locationOptions = {
//         accuracy: ExpoLocation.Accuracy.BestForNavigation,
//         timeInterval: 5000,
//         distanceInterval: 10, // Update every 10 meters
//         mayShowUserSettingsDialog: true,
//       };

//       // First try to get a fresh location
//       let location = await ExpoLocation.getCurrentPositionAsync(
//         locationOptions
//       );

//       // Check if location is fresh (less than 30 seconds old)
//       const isFresh =
//         new Date().getTime() - new Date(location.timestamp).getTime() < 30000;

//       if (!isFresh) {
//         // If not fresh, try getting last known position as fallback
//         const lastKnown = await ExpoLocation.getLastKnownPositionAsync();
//         if (lastKnown) {
//           location = lastKnown;
//         }
//       }

//       const newRegion = {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         latitudeDelta: 0.005,
//         longitudeDelta: 0.005,
//       };

//       // Only update if position changed significantly
//       if (
//         !markerPosition ||
//         Math.abs(markerPosition.latitude - location.coords.latitude) > 0.0001 ||
//         Math.abs(markerPosition.longitude - location.coords.longitude) > 0.0001
//       ) {
//         setMarkerPosition({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//         });
//         setRegion(newRegion);

//         if (mapRef.current) {
//           mapRef.current.animateToRegion(newRegion, 1000);
//         }

//         await fetchAddressFromCoordinates(
//           location.coords.latitude,
//           location.coords.longitude
//         );
//       }
//     } catch (error) {
//       console.error("Location error:", error);
//       Alert.alert(
//         "Location Error",
//         "Could not get your current location. Please try again."
//       );
//     } finally {
//       setLoading(false);
//       isGettingLocationRef.current = false;
//     }
//   }, [fetchAddressFromCoordinates, requestLocationPermission, markerPosition]);

//   // Start watching location when component mounts
//   useEffect(() => {
//     const startWatching = async () => {
//       const hasPermission = await requestLocationPermission();
//       if (!hasPermission) return;

//       watchIdRef.current = await ExpoLocation.watchPositionAsync(
//         {
//           accuracy: ExpoLocation.Accuracy.High,
//           distanceInterval: 10, // Update every 10 meters
//           timeInterval: 5000, // 5 seconds
//         },
//         (location) => {
//           if (
//             !markerPosition ||
//             Math.abs(markerPosition.latitude - location.coords.latitude) >
//               0.0001 ||
//             Math.abs(markerPosition.longitude - location.coords.longitude) >
//               0.0001
//           ) {
//             setMarkerPosition({
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//             });
//           }
//         }
//       );
//     };

//     startWatching();

//     return () => {
//       if (watchIdRef.current) {
//         ExpoLocation.removeWatch(watchIdRef.current);
//       }
//     };
//   }, [requestLocationPermission, markerPosition]);

//   const handleMapReady = useCallback(() => {
//     setMapReady(true);
//     if (!initialRegion && !markerPosition) {
//       getCurrentLocation();
//     } else if (region && mapRef.current) {
//       mapRef.current.animateToRegion(region, 500);
//     }
//   }, [getCurrentLocation, initialRegion, markerPosition, region]);

//   const handleMapPress = async (e: any) => {
//     const { latitude, longitude } = e.nativeEvent.coordinate;
//     setMarkerPosition({ latitude, longitude });
//     await fetchAddressFromCoordinates(latitude, longitude);
//   };

//   const handleRegionChange = (newRegion: Region) => {
//     setRegion(newRegion);
//   };

//   const handleConfirmLocation = async () => {
//     if (addressLoading || loading || !markerPosition) return;

//     try {
//       const locationData = await fetchAddressFromCoordinates(
//         markerPosition.latitude,
//         markerPosition.longitude
//       );

//       const newLocation: Location = {
//         address: locationData.address,
//         city: locationData.city,
//         postalCode: locationData.postalCode,
//         latitude: markerPosition.latitude,
//         longitude: markerPosition.longitude,
//       };

//       dispatch(setCurrentLocation(newLocation));
//       onLocationSelect(newLocation);
//     } catch (error) {
//       console.error("Error confirming location:", error);
//       Alert.alert("Error", "Failed to save location");
//     }
//   };

//   if (loading && !markerPosition) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#F8C52B" />
//         <Text style={styles.loadingText}>Getting your location...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {region && (
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           provider={PROVIDER_GOOGLE}
//           initialRegion={region}
//           onRegionChangeComplete={handleRegionChange}
//           onPress={handleMapPress}
//           showsUserLocation={locationPermission}
//           showsMyLocationButton={false}
//           followsUserLocation={false}
//           moveOnMarkerPress={false}
//           showsPointsOfInterest={false}
//           showsBuildings={false}
//           toolbarEnabled={false}
//           cacheEnabled={true}
//           onMapReady={handleMapReady}
//         >
//           {markerPosition && (
//             <Marker coordinate={markerPosition} tracksViewChanges={false} />
//           )}
//         </MapView>
//       )}

//       <View style={styles.addressContainer}>
//         <Ionicons name="location" size={20} color="#333" />
//         {addressLoading ? (
//           <ActivityIndicator size="small" color="#F8C52B" />
//         ) : (
//           <Text style={styles.addressText} numberOfLines={2}>
//             {address || "Select a location"}
//           </Text>
//         )}
//       </View>

//       <TouchableOpacity
//         style={[
//           styles.confirmButton,
//           (addressLoading || !address || !markerPosition) &&
//             styles.disabledButton,
//         ]}
//         onPress={handleConfirmLocation}
//         disabled={addressLoading || !address || !markerPosition}
//       >
//         <Text style={styles.confirmButtonText}>Confirm Location</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.currentLocationButton}
//         onPress={getCurrentLocation}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#3F63C7" />
//         ) : (
//           <Ionicons name="locate" size={24} color="#333" />
//         )}
//       </TouchableOpacity>

//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#3F63C7" />
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 10,
//   },
//   addressContainer: {
//     position: "absolute",
//     top: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: "white",
//     padding: 15,
//     borderRadius: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   addressText: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   confirmButton: {
//     position: "absolute",
//     bottom: 40,
//     left: 20,
//     right: 20,
//     backgroundColor: "#3F63C7",
//     padding: 15,
//     borderRadius: 25,
//     alignItems: "center",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   disabledButton: {
//     backgroundColor: "#ccc",
//   },
//   confirmButtonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   currentLocationButton: {
//     position: "absolute",
//     bottom: 120,
//     right: 20,
//     backgroundColor: "white",
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
