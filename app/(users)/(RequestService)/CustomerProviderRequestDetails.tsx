// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   SafeAreaView,
//   ScrollView,
//   Image,
// } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";
// import * as ExpoLocation from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import { router, useLocalSearchParams } from "expo-router";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store/store";
// import { getServiceRequestById } from "@/store/slice/serviceRequest";

// import { getOfferById } from "@/store/slice/serviceOffer";

// const GOOGLE_MAPS_API_KEY = "AIzaSyB8s9qKa8kx8AHQU3dXK3xbbKiMCxwNR9Q";

// export default function CustomerRequestDetails() {
//   const { offerId, serviceRequestId } = useLocalSearchParams();
//   const dispatch = useDispatch<AppDispatch>();
//   const [serviceRequest, setServiceRequest] = useState<any>(null);
//   const [offerDetails, setOfferDetails] = useState<any>(null);
//   const [currentLocation, setCurrentLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);
//   const [distance, setDistance] = useState<string>("Calculating...");
//   const [duration, setDuration] = useState<string>("Calculating...");
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const mapRef = useRef<MapView | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         if (offerId) {
//           const offerResponse = await dispatch(
//             getOfferById(offerId as string)
//           ).unwrap();
//           setOfferDetails(offerResponse);
//         }
//         if (serviceRequestId) {
//           const requestResponse = await dispatch(
//             getServiceRequestById(serviceRequestId as string)
//           ).unwrap();
//           setServiceRequest(requestResponse);
//         }
//         await requestLocationAndCalculateRoute();
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         Alert.alert("Error", "Failed to load required information.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [offerId, serviceRequestId, dispatch]);

//   const requestLocationAndCalculateRoute = async () => {
//     const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Denied",
//         "Location permission is required to show distance to service provider."
//       );
//       return;
//     }
//     try {
//       const location = await ExpoLocation.getCurrentPositionAsync({
//         accuracy: ExpoLocation.Accuracy.High,
//       });
//       const { latitude, longitude } = location.coords;
//       setCurrentLocation({ latitude, longitude });

//       if (
//         serviceRequest &&
//         serviceRequest.locationLatitude &&
//         serviceRequest.locationLongitude
//       ) {
//         calculateDetailedRoute(latitude, longitude);
//       }
//     } catch (error) {
//       console.error("Error getting location:", error);
//       Alert.alert("Error", "Failed to get your current location");
//     }
//   };

//   const calculateDetailedRoute = async (startLat: number, startLng: number) => {
//     if (
//       !serviceRequest ||
//       !serviceRequest.locationLatitude ||
//       !serviceRequest.locationLongitude
//     ) {
//       return;
//     }
//     try {
//       // Simulate fetching route info from Google Maps API
//       const result = {
//         distanceMatrix: {
//           distance: "5.0 km",
//           duration: "10.5 mins",
//         },
//         polyline: [
//           { latitude: startLat, longitude: startLng },
//           {
//             latitude: serviceRequest.locationLatitude,
//             longitude: serviceRequest.locationLongitude,
//           },
//         ],
//       };

//       setDistance(result.distanceMatrix.distance);
//       setDuration(result.distanceMatrix.duration);

//       if (mapRef.current && result.polyline.length > 0) {
//         mapRef.current.fitToCoordinates(result.polyline, {
//           edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//           animated: true,
//         });
//       }
//     } catch (error) {
//       console.error("Error calculating route:", error);
//       setDistance("Unavailable");
//       setDuration("Unavailable");
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3F63C7" />
//         <Text style={styles.loadingText}>Loading request details...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Map Section */}
//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           provider={PROVIDER_GOOGLE}
//           initialRegion={{
//             latitude: currentLocation?.latitude || 0,
//             longitude: currentLocation?.longitude || 0,
//             latitudeDelta: 0.0922,
//             longitudeDelta: 0.0421,
//           }}
//           showsUserLocation
//         >
//           {currentLocation && (
//             <Marker
//               coordinate={{
//                 latitude: currentLocation.latitude,
//                 longitude: currentLocation.longitude,
//               }}
//               title="Your Location"
//             >
//               <View style={styles.originMarker}>
//                 <Ionicons name="person" size={18} color="#FFFFFF" />
//               </View>
//             </Marker>
//           )}
//           {serviceRequest && (
//             <Marker
//               coordinate={{
//                 latitude: serviceRequest.locationLatitude,
//                 longitude: serviceRequest.locationLongitude,
//               }}
//               title="Service Provider Location"
//             >
//               <View style={styles.destinationMarker}>
//                 <Ionicons name="location" size={20} color="#FFFFFF" />
//               </View>
//             </Marker>
//           )}
//           <MapViewDirections
//             origin={{
//               latitude: currentLocation?.latitude || 0,
//               longitude: currentLocation?.longitude || 0,
//             }}
//             destination={{
//               latitude: serviceRequest?.locationLatitude || 0,
//               longitude: serviceRequest?.locationLongitude || 0,
//             }}
//             apikey={GOOGLE_MAPS_API_KEY}
//             strokeWidth={4}
//             strokeColor="#FF3B30"
//             onReady={(result) => {
//               setDistance(`${result.distance.toFixed(2)} km`);
//               setDuration(`${result.duration.toFixed(1)} mins`);
//             }}
//           />
//         </MapView>
//       </View>

//       {/* Service Provider Details Section */}
//       <ScrollView style={styles.infoPanel}>
//         <View style={styles.headerSection}>
//           <Text style={styles.heading}>Service Provider Details</Text>
//           <View style={styles.distanceContainer}>
//             <Ionicons name="navigate" size={20} color="#3F63C7" />
//             <Text style={styles.distanceText}>
//               {distance} ({duration})
//             </Text>
//           </View>
//         </View>

//         <View style={styles.providerDetailsContainer}>
//           <Image
//             source={{ uri: offerDetails?.providerProfileImage }}
//             style={styles.profileImage}
//           />
//           <Text style={styles.providerName}>{offerDetails?.providerName}</Text>
//           <Text style={styles.contactNumber}>
//             Contact: {offerDetails?.contactNumber}
//           </Text>
//         </View>

//         {/* Service Request Details */}
//         <View style={styles.detailsContainer}>
//           <Text style={styles.label}>Selected Services</Text>
//           <Text style={styles.value}>
//             {serviceRequest?.serviceListNames?.join(", ") || "N/A"}
//           </Text>
//           <Text style={styles.label}>Description</Text>
//           <Text style={styles.value}>
//             {serviceRequest?.description || "No additional details provided"}
//           </Text>
//           <Text style={styles.label}>Location</Text>
//           <Text style={styles.value}>
//             {serviceRequest?.locationAddress || "N/A"}
//           </Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: "#808080",
//   },
//   mapContainer: {
//     flex: 1,
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   infoPanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   headerSection: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333333",
//   },
//   distanceContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F0F4FF",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 12,
//   },
//   distanceText: {
//     marginLeft: 5,
//     fontSize: 14,
//     color: "#3F63C7",
//     fontWeight: "500",
//   },
//   providerDetailsContainer: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   profileImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     marginBottom: 10,
//   },
//   providerName: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333333",
//   },
//   contactNumber: {
//     fontSize: 14,
//     color: "#808080",
//   },
//   detailsContainer: {
//     backgroundColor: "#F9F9F9",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 14,
//     color: "#808080",
//     marginBottom: 5,
//   },
//   value: {
//     fontSize: 16,
//     color: "#333333",
//     marginBottom: 12,
//   },
//   originMarker: {
//     backgroundColor: "#3F63C7",
//     borderRadius: 18,
//     padding: 6,
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//   },
//   destinationMarker: {
//     backgroundColor: "#FF3B30",
//     borderRadius: 18,
//     padding: 6,
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//   },
// });
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as ExpoLocation from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getServiceRequestById } from "@/store/slice/serviceRequest";
import {
  clearOffers,
  clearRequestsWithOffers,
  getOfferById,
  resetServiceOfferState,
} from "@/store/slice/serviceOffer";
import { useServiceRequestSignalR } from "@/hooks/useServiceRequestSignalR";
import { useServiceOfferSignalR } from "@/hooks/useServiceOfferSignalR";
import { clearCurrentOffer } from "@/store/slice/serviceOffer";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyB8s9qKa8kx8AHQU3dXK3xbbKiMCxwNR9Q";

// Panel dimensions
const { height } = Dimensions.get("window");
const PANEL_MIN_HEIGHT = 400;
const PANEL_MAX_HEIGHT = height * 0.6;
const DRAG_THRESHOLD = 50;

export default function CustomerRequestDetails() {
  const { offerId, serviceRequestId } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useSelector((state: RootState) => state.auth);
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  // const [offerDetails, setOfferDetails] = useState<any>(null);
  const offerDetails = useSelector(
    (state: RootState) => state.serviceOffer.currentOffer // or relevant slice
  );

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [duration, setDuration] = useState<string>("Calculating...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const mapRef = useRef<MapView | null>(null);

  // Panel state
  const [panelHeight, setPanelHeight] = useState(PANEL_MIN_HEIGHT);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const lastY = useRef(0);
  const animatedHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;

  // SignalR connections
  const { connected: requestSignalRConnected } = useServiceRequestSignalR(
    undefined,
    userId as string
  );
  const { connected: offerSignalRConnected } = useServiceOfferSignalR(
    null,
    serviceRequestId as string
  );

  // Location tracking subscription
  const locationSubscriptionRef = useRef<any>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       if (offerId) {
  //         const offerResponse = await dispatch(
  //           getOfferById(offerId as string)
  //         ).unwrap();
  //       }
  //       if (serviceRequestId) {
  //         const requestResponse = await dispatch(
  //           getServiceRequestById(serviceRequestId as string)
  //         ).unwrap();
  //         setServiceRequest(requestResponse);
  //       }

  //       // Start location tracking after fetching initial data
  //       await requestLocationPermissionAndStartTracking();
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       Alert.alert("Error", "Failed to load required information.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchData();

  //   // Cleanup function
  //   return () => {
  //     if (locationSubscriptionRef.current) {
  //       locationSubscriptionRef.current.then((sub: any) => sub.remove());
  //     }
  //   };
  // }, [offerId, serviceRequestId, dispatch]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Clear stale offer before fetching new one
        dispatch(clearCurrentOffer());

        if (offerId) {
          await dispatch(getOfferById(offerId as string)).unwrap();
        }
        if (serviceRequestId) {
          const requestResponse = await dispatch(
            getServiceRequestById(serviceRequestId as string)
          ).unwrap();
          setServiceRequest(requestResponse);
        }

        await requestLocationPermissionAndStartTracking();
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load required information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.then((sub: any) => sub.remove());
      }
    };
  }, [offerId, serviceRequestId, dispatch]);

  useEffect(() => {
    if (serviceRequest?.status === "Completed") {
      Alert.alert(
        "Service Completed",
        "The service request has been marked as completed.",
        [
          {
            text: "Return Home",
            onPress: () => router.replace("/(tabs)/home"),
          },
        ]
      );
    }
  }, [serviceRequest?.status]);

  // Set up panel animation listener
  useEffect(() => {
    animatedHeight.addListener(({ value }) => {
      setPanelHeight(value);
    });
    return () => {
      animatedHeight.removeAllListeners();
    };
  }, []);

  // Update status notification when offer status changes
  useEffect(() => {
    if (offerDetails?.status === "In_Progress") {
      Alert.alert(
        "Provider Arrived",
        "The service provider has reached your location and started the work."
      );
    } else if (offerDetails?.status === "Completed") {
      Alert.alert(
        "Provider Update",
        "The service provider has completed the work.",
        [{ text: "Go to Home", onPress: () => router.replace("/(tabs)/home") }]
      );
      dispatch(resetServiceOfferState());
      dispatch(clearCurrentOffer());
      dispatch(clearRequestsWithOffers());
      dispatch(clearOffers());
    }
  }, [offerDetails?.status]);

  const requestLocationPermissionAndStartTracking = async () => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to show distance to service provider."
      );
      return;
    }

    try {
      // Get initial location
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      // Start watching position
      const subscription = ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });
        }
      );

      // Store subscription reference for cleanup
      locationSubscriptionRef.current = subscription;

      return subscription;
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your current location");
    }
  };

  // Update map and calculate route when currentLocation or serviceRequest changes
  useEffect(() => {
    if (
      currentLocation &&
      serviceRequest &&
      serviceRequest.locationLatitude &&
      serviceRequest.locationLongitude
    ) {
      // Calculate new route
      calculateDetailedRoute();

      // Update map region to show both points
      const midLat =
        (currentLocation.latitude + serviceRequest.locationLatitude) / 2;
      const midLng =
        (currentLocation.longitude + serviceRequest.locationLongitude) / 2;

      const latDelta =
        Math.abs(currentLocation.latitude - serviceRequest.locationLatitude) *
        3;
      const lngDelta =
        Math.abs(currentLocation.longitude - serviceRequest.locationLongitude) *
        3;

      setMapRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(0.01, latDelta),
        longitudeDelta: Math.max(0.01, lngDelta),
      });
    }
  }, [currentLocation, serviceRequest]);

  const calculateDetailedRoute = async () => {
    if (
      !currentLocation ||
      !serviceRequest ||
      !serviceRequest.locationLatitude ||
      !serviceRequest.locationLongitude
    ) {
      return;
    }

    try {
      // For the purpose of this example, simulating a route response
      // In a real app, you would call your googleMapsService
      const distanceValue = 5.2;
      const durationValue = 12.5;

      const formattedDistance = distanceValue.toFixed(2) + " km";
      const formattedDuration = durationValue.toFixed(1) + " mins";

      setDistance(formattedDistance);
      setDuration(formattedDuration);

      // Simulate polyline coordinates for the route
      const simulatedPolyline = [
        currentLocation,
        {
          latitude: serviceRequest.locationLatitude,
          longitude: serviceRequest.locationLongitude,
        },
      ];

      setRouteCoordinates(simulatedPolyline);

      if (mapRef.current && simulatedPolyline.length > 0) {
        mapRef.current.fitToCoordinates(simulatedPolyline, {
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastY.current = 0;
      },
      onPanResponderMove: (_, gesture) => {
        const dy = gesture.dy - lastY.current;
        lastY.current = gesture.dy;

        const newHeight = Math.max(
          PANEL_MIN_HEIGHT,
          Math.min(PANEL_MAX_HEIGHT, panelHeight - dy)
        );
        animatedHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -DRAG_THRESHOLD) {
          Animated.spring(animatedHeight, {
            toValue: PANEL_MAX_HEIGHT,
            useNativeDriver: false,
            friction: 7,
          }).start();
          setIsPanelExpanded(true);
        } else if (gesture.dy > DRAG_THRESHOLD) {
          Animated.spring(animatedHeight, {
            toValue: PANEL_MIN_HEIGHT,
            useNativeDriver: false,
            friction: 7,
          }).start();
          setIsPanelExpanded(false);
        } else {
          const toValue =
            panelHeight > (PANEL_MIN_HEIGHT + PANEL_MAX_HEIGHT) / 2
              ? PANEL_MAX_HEIGHT
              : PANEL_MIN_HEIGHT;

          Animated.spring(animatedHeight, {
            toValue,
            useNativeDriver: false,
            friction: 7,
          }).start();
          setIsPanelExpanded(toValue === PANEL_MAX_HEIGHT);
        }
      },
    })
  ).current;

  const renderRouteOverview = () => {
    if (!serviceRequest || !serviceRequest.locationAddress) return null;
    return (
      <View style={styles.routeOverviewContainer}>
        <View style={styles.routeEndpointContainer}>
          <View style={styles.endpointDot} />
          <Text style={styles.currentLocationText}>Current Location</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeEndpointContainer}>
          <View style={[styles.endpointDot, styles.destinationDot]} />
          <Text style={styles.destinationText}>
            {serviceRequest.locationAddress}
          </Text>
        </View>
      </View>
    );
  };

  const renderStatusBadge = () => {
    let badgeStyle = styles.statusBadgePending;
    let textStyle = styles.statusTextPending;
    let statusText = "Pending";

    if (offerDetails) {
      switch (offerDetails.status) {
        case "Accepted":
          badgeStyle = styles.statusBadgeAccepted;
          textStyle = styles.statusTextAccepted;
          statusText = "Accepted";
          break;
        case "In_Progress":
          badgeStyle = styles.statusBadgeInProgress;
          textStyle = styles.statusTextInProgress;
          statusText = "Provider Arrived";
          break;
        case "Completed":
          badgeStyle = styles.statusBadgeCompleted;
          textStyle = styles.statusTextCompleted;
          statusText = "Completed";
          break;
        default:
          break;
      }
    }

    return (
      <View style={badgeStyle}>
        <Text style={textStyle}>{statusText}</Text>
      </View>
    );
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
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          showsUserLocation={true}
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
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {serviceRequest &&
            serviceRequest.locationLatitude &&
            serviceRequest.locationLongitude && (
              <Marker
                coordinate={{
                  latitude: serviceRequest.locationLatitude,
                  longitude: serviceRequest.locationLongitude,
                }}
                title="Service Provider Location"
              >
                <View style={styles.destinationMarker}>
                  <Ionicons name="location" size={18} color="#FFFFFF" />
                </View>
              </Marker>
            )}

          {currentLocation &&
            serviceRequest &&
            serviceRequest.locationLatitude &&
            serviceRequest.locationLongitude && (
              <MapViewDirections
                origin={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                destination={{
                  latitude: serviceRequest.locationLatitude,
                  longitude: serviceRequest.locationLongitude,
                }}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={4}
                strokeColor="#FF3B30"
                onReady={(result) => {
                  const distanceValue = result.distance;
                  const formattedDistance = distanceValue.toFixed(2) + " km";
                  const durationValue = result.duration;
                  const formattedDuration = durationValue.toFixed(1) + " mins";

                  setDistance(formattedDistance);
                  setDuration(formattedDuration);

                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                  });
                }}
              />
            )}
        </MapView>
      </View>

      <Animated.View style={[styles.infoPanel, { height: animatedHeight }]}>
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView style={styles.panelScrollView}>
          <View style={styles.headerSection}>
            <Text style={styles.heading}>Service Provider Details</Text>
            <View style={styles.distanceContainer}>
              <Ionicons name="navigate" size={20} color="#3F63C7" />
              <Text style={styles.distanceText}>
                {distance} ({duration})
              </Text>
            </View>
          </View>

          {renderStatusBadge()}

          <View style={styles.providerDetailsContainer}>
            {/* <Image
              source={{
                uri:
                  offerDetails?.providerProfileImage ||
                  "https://via.placeholder.com/80",
              }}
              style={styles.profileImage}
            /> */}
            <Text style={styles.providerName}>
              {offerDetails?.providerName || "Provider"}
            </Text>
            <Text style={styles.contactNumber}>
              Contact: {offerDetails?.providerName || "N/A"}
            </Text>
          </View>

          {renderRouteOverview()}

          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Service Category</Text>
            <Text style={styles.value}>
              {serviceRequest?.serviceCategoryName || "N/A"}
            </Text>
            <Text style={styles.label}>Selected Services</Text>
            <Text style={styles.value}>
              {serviceRequest?.serviceListNames?.join(", ") || "N/A"}
            </Text>

            <Text style={styles.label}>Problem Images</Text>
            {serviceRequest?.serviceRequestImagePaths?.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesContainer}
              >
                {serviceRequest.serviceRequestImagePaths.map(
                  (imageUri: string) => (
                    <Image
                      key={imageUri}
                      source={{ uri: `http://10.0.2.2:5039${imageUri}` }}
                      style={styles.problemImage}
                      resizeMode="cover"
                    />
                  )
                )}
              </ScrollView>
            ) : (
              <Text style={styles.value}>No images uploaded</Text>
            )}

            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>
              {serviceRequest?.description || "No additional details provided"}
            </Text>
            <Text style={styles.label}>Your Location</Text>
            <Text style={styles.value}>
              {serviceRequest?.locationAddress || "N/A"}
            </Text>
            <Text style={styles.label}>Provider's Offer</Text>
            <Text style={styles.priceValue}>
              NPR {offerDetails?.offeredPrice || "N/A"}
            </Text>
          </View>

          {serviceRequest?.status === "Completed" && (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace("/(tabs)/home")}
            >
              <Ionicons name="home" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Return Home</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
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
  imagesContainer: {
    flexDirection: "row",

    marginTop: 10,
  },

  problemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
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
  dragHandleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#DDDDDD",
    borderRadius: 3,
  },
  panelScrollView: {
    flex: 1,
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
    paddingVertical: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#F0F0F0",
  },
  providerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  contactNumber: {
    fontSize: 14,
    color: "#808080",
    marginTop: 4,
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
  priceValue: {
    fontSize: 18,
    color: "#3F63C7",
    fontWeight: "600",
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
  routeOverviewContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  routeEndpointContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  endpointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3F63C7",
    marginRight: 10,
  },
  destinationDot: {
    backgroundColor: "#FF3B30",
  },
  currentLocationText: {
    fontSize: 14,
    color: "#333333",
  },
  destinationText: {
    fontSize: 14,
    color: "#333333",
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: "#DDDDDD",
    marginLeft: 5,
  },
  statusBadgePending: {
    backgroundColor: "#FFF0E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  statusTextPending: {
    color: "#FF9500",
    fontWeight: "600",
    fontSize: 14,
  },
  statusBadgeAccepted: {
    backgroundColor: "#E0F0FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  statusTextAccepted: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
  statusBadgeInProgress: {
    backgroundColor: "#E0FFEA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  statusTextInProgress: {
    color: "#34C759",
    fontWeight: "600",
    fontSize: 14,
  },
  statusBadgeCompleted: {
    backgroundColor: "#D8FFD8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  statusTextCompleted: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
  },
  homeButton: {
    backgroundColor: "#3F63C7",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
