// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   SafeAreaView,
//   Animated,
//   PanResponder,
//   Dimensions,
//   ScrollView,
// } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";
// import * as ExpoLocation from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import { router, useLocalSearchParams } from "expo-router";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store/store";
// import {
//   getServiceRequestById,
//   updateServiceRequestStatus,
// } from "@/store/slice/serviceRequest";
// import { getOfferById, updateOfferStatus } from "@/store/slice/serviceOffer";
// import { googleMapsService } from "@/store/slice/googleMapsService";
// import { useServiceRequestSignalR } from "@/hooks/useServiceRequestSignalR";

// // Google Maps API Key
// const GOOGLE_MAPS_API_KEY = "AIzaSyB8s9qKa8kx8AHQU3dXK3xbbKiMCxwNR9Q";

// // Panel dimensions
// const { height } = Dimensions.get("window");
// const PANEL_MIN_HEIGHT = 400;
// const PANEL_MAX_HEIGHT = height * 0.6;
// const DRAG_THRESHOLD = 50;

// type WorkStatus = "Pending" | "Accepted" | "In_Progress" | "Completed";

// export default function ServiceProviderWorkflow() {
//   const { offerId, serviceRequestId } = useLocalSearchParams();
//   const dispatch = useDispatch<AppDispatch>();
//   const { userId } = useSelector((state: RootState) => state.auth);
//   const [serviceRequest, setServiceRequest] = useState<any>(null);
//   const [offerDetails, setOfferDetails] = useState<any>(null);
//   const [currentLocation, setCurrentLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);
//   const [distance, setDistance] = useState<string>("Calculating...");
//   const [duration, setDuration] = useState<string>("Calculating...");
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
//   const [workStatus, setWorkStatus] = useState<WorkStatus>("Accepted");
//   const mapRef = useRef<MapView | null>(null);
//   const [mapRegion, setMapRegion] = useState<any>(null);

//   // Panel state
//   const [panelHeight, setPanelHeight] = useState(PANEL_MIN_HEIGHT);
//   const [isPanelExpanded, setIsPanelExpanded] = useState(false);
//   const lastY = useRef(0);
//   const animatedHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;
//   const { connected: requestSignalRConnected } = useServiceRequestSignalR(
//     undefined,
//     serviceRequestId as string
//   );

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         if (offerId) {
//           const offerResponse = await dispatch(
//             getOfferById(offerId as string)
//           ).unwrap();
//           setOfferDetails(offerResponse);
//           setWorkStatus(offerResponse.status || "Accepted");
//         }
//         if (serviceRequestId) {
//           const requestResponse = await dispatch(
//             getServiceRequestById(serviceRequestId as string)
//           ).unwrap();
//           setServiceRequest(requestResponse);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         Alert.alert("Error", "Failed to load required information.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [offerId, serviceRequestId, dispatch]);

//   useEffect(() => {
//     if (serviceRequest?.status === "Completed") {
//       Alert.alert(
//         "Service Completed",
//         "The service request has been marked as completed.",
//         [
//           {
//             text: "OK",
//             onPress: () => router.replace("/(serviceProvider)/(tab)/home"),
//           },
//         ]
//       );
//     }
//   }, [serviceRequest?.status]);

//   // Set up panel animation listener
//   useEffect(() => {
//     animatedHeight.addListener(({ value }) => {
//       setPanelHeight(value);
//     });
//     return () => {
//       animatedHeight.removeAllListeners();
//     };
//   }, []);

//   const requestLocationAndCalculateRoute = async () => {
//     const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Denied",
//         "Location permission is required to show distance to customer."
//       );
//       return;
//     }
//     try {
//       const location = await ExpoLocation.getCurrentPositionAsync({
//         accuracy: ExpoLocation.Accuracy.High,
//       });
//       const { latitude, longitude } = location.coords;
//       setCurrentLocation({ latitude, longitude });

//       const locationSubscription = ExpoLocation.watchPositionAsync(
//         {
//           accuracy: ExpoLocation.Accuracy.High,
//           timeInterval: 5000,
//           distanceInterval: 10,
//         },
//         (location) => {
//           const { latitude, longitude } = location.coords;
//           setCurrentLocation({ latitude, longitude });
//           if (
//             serviceRequest &&
//             serviceRequest.locationLatitude &&
//             serviceRequest.locationLongitude
//           ) {
//             calculateDetailedRoute(latitude, longitude);
//           }
//         }
//       );

//       return () => {
//         locationSubscription.then((sub) => sub.remove());
//       };
//     } catch (error) {
//       console.error("Error getting location:", error);
//       Alert.alert("Error", "Failed to get your current location");
//     }
//   };

//   useEffect(() => {
//     if (
//       currentLocation &&
//       serviceRequest &&
//       serviceRequest.locationLatitude &&
//       serviceRequest.locationLongitude
//     ) {
//       calculateDetailedRoute(
//         currentLocation.latitude,
//         currentLocation.longitude
//       );

//       const midLat =
//         (currentLocation.latitude + serviceRequest.locationLatitude) / 2;
//       const midLng =
//         (currentLocation.longitude + serviceRequest.locationLongitude) / 2;

//       const latDelta =
//         Math.abs(currentLocation.latitude - serviceRequest.locationLatitude) *
//         3;
//       const lngDelta =
//         Math.abs(currentLocation.longitude - serviceRequest.locationLongitude) *
//         3;

//       setMapRegion({
//         latitude: midLat,
//         longitude: midLng,
//         latitudeDelta: Math.max(0.01, latDelta),
//         longitudeDelta: Math.max(0.01, lngDelta),
//       });
//     }
//   }, [currentLocation, serviceRequest]);

//   const calculateDetailedRoute = async (startLat: number, startLng: number) => {
//     if (
//       !serviceRequest ||
//       !serviceRequest.locationLatitude ||
//       !serviceRequest.locationLongitude
//     ) {
//       return;
//     }
//     try {
//       const result = await googleMapsService.getRouteInfo(
//         startLat,
//         startLng,
//         serviceRequest.locationLatitude,
//         serviceRequest.locationLongitude
//       );

//       if (result) {
//         const distanceValue = parseFloat(
//           result.distanceMatrix.distance.replace(" km", "")
//         );
//         const formattedDistance = distanceValue.toFixed(2) + " km";

//         const durationValue = parseFloat(
//           result.distanceMatrix.duration.replace(" mins", "")
//         );
//         const formattedDuration = durationValue.toFixed(1) + " mins";

//         setDistance(formattedDistance);
//         setDuration(formattedDuration);
//         setRouteCoordinates(result.polyline);

//         if (mapRef.current && result.polyline.length > 0) {
//           mapRef.current.fitToCoordinates(result.polyline, {
//             edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//             animated: true,
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error calculating route:", error);
//       setDistance("Unavailable");
//       setDuration("Unavailable");
//     }
//   };

//   const handleReachedDestination = async () => {
//     try {
//       if (workStatus === "In_Progress") return; // Prevent duplicate updates

//       setIsLoading(true);
//       if (!offerId) {
//         Alert.alert("Error", "Offer information not found");
//         return;
//       }
//       if (!serviceRequestId) {
//         Alert.alert("Error", "Request information not found");
//         return;
//       }

//       // Only update the offer status, not the request status
//       await dispatch(
//         updateOfferStatus({
//           offerId: offerId as string,
//           status: "In_Progress",
//         })
//       ).unwrap();

//       setWorkStatus("In_Progress");
//       Alert.alert("Arrival Confirmed", "You can now begin the service work.");
//     } catch (error) {
//       console.error("Error updating status:", error);
//       Alert.alert("Error", "Failed to update status. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   const handleCompletedWork = async () => {
//     if (workStatus === "Completed" || isLoading) return;

//     try {
//       setIsLoading(true);
//       if (!offerId || !serviceRequestId) {
//         Alert.alert("Error", "Required information not found");
//         return;
//       }

//       // Update offer status only
//       await dispatch(
//         updateOfferStatus({
//           offerId: offerId as string,
//           status: "Completed",
//         })
//       ).unwrap();

//       // Delay for SignalR sync
//       await new Promise((resolve) => setTimeout(resolve, 300));

//       // Trigger request status update (UI will sync via SignalR)
//       await dispatch(
//         updateServiceRequestStatus({
//           requestId: serviceRequestId as string,
//           status: "Completed",
//         })
//       ).unwrap();

//       // **REMOVE** local setWorkStatus("Completed") here
//       // Wait for SignalR to handle UI updates
//     } catch (error) {
//       console.error("Error updating status:", error);
//       Alert.alert("Error", "Failed to update status. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderGrant: () => {
//         lastY.current = 0;
//       },
//       onPanResponderMove: (_, gesture) => {
//         const dy = gesture.dy - lastY.current;
//         lastY.current = gesture.dy;

//         const newHeight = Math.max(
//           PANEL_MIN_HEIGHT,
//           Math.min(PANEL_MAX_HEIGHT, panelHeight - dy)
//         );
//         animatedHeight.setValue(newHeight);
//       },
//       onPanResponderRelease: (_, gesture) => {
//         if (gesture.dy < -DRAG_THRESHOLD) {
//           Animated.spring(animatedHeight, {
//             toValue: PANEL_MAX_HEIGHT,
//             useNativeDriver: false,
//             friction: 7,
//           }).start();
//           setIsPanelExpanded(true);
//         } else if (gesture.dy > DRAG_THRESHOLD) {
//           Animated.spring(animatedHeight, {
//             toValue: PANEL_MIN_HEIGHT,
//             useNativeDriver: false,
//             friction: 7,
//           }).start();
//           setIsPanelExpanded(false);
//         } else {
//           const toValue =
//             panelHeight > (PANEL_MIN_HEIGHT + PANEL_MAX_HEIGHT) / 2
//               ? PANEL_MAX_HEIGHT
//               : PANEL_MIN_HEIGHT;

//           Animated.spring(animatedHeight, {
//             toValue,
//             useNativeDriver: false,
//             friction: 7,
//           }).start();
//           setIsPanelExpanded(toValue === PANEL_MAX_HEIGHT);
//         }
//       },
//     })
//   ).current;

//   const renderRouteOverview = () => {
//     if (!serviceRequest || !serviceRequest.locationAddress) return null;
//     return (
//       <View style={styles.routeOverviewContainer}>
//         <View style={styles.routeEndpointContainer}>
//           <View style={styles.endpointDot} />
//           <Text style={styles.currentLocationText}>Current Location</Text>
//         </View>
//         <View style={styles.routeLine} />
//         <View style={styles.routeEndpointContainer}>
//           <View style={[styles.endpointDot, styles.destinationDot]} />
//           <Text style={styles.destinationText}>
//             {serviceRequest.locationAddress}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   const renderActionButton = () => {
//     console.log("Current workStatus:", workStatus);
//     switch (workStatus) {
//       case "Accepted":
//         return (
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={handleReachedDestination}
//             disabled={isLoading}
//           >
//             <Ionicons name="location" size={20} color="#FFFFFF" />
//             <Text style={styles.buttonText}>I've Reached the Destination</Text>
//           </TouchableOpacity>
//         );
//       case "In_Progress":
//         return (
//           <TouchableOpacity
//             style={styles.completeButton}
//             onPress={handleCompletedWork}
//             disabled={isLoading}
//           >
//             <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
//             <Text style={styles.buttonText}>I've Completed the Work</Text>
//           </TouchableOpacity>
//         );
//       case "Completed":
//         return (
//           <View style={styles.completedContainer}>
//             <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
//             <Text style={styles.completedText}>Work Completed</Text>
//           </View>
//         );
//       default:
//         return null;
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3F63C7" />
//         <Text style={styles.loadingText}>Loading service details...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           provider={PROVIDER_GOOGLE}
//           initialRegion={mapRegion}
//           showsUserLocation={true}
//         >
//           {serviceRequest &&
//             serviceRequest.locationLatitude &&
//             serviceRequest.locationLongitude && (
//               <Marker
//                 coordinate={{
//                   latitude: serviceRequest.locationLatitude,
//                   longitude: serviceRequest.locationLongitude,
//                 }}
//                 title="Customer Location"
//                 identifier="destination"
//               >
//                 <View style={styles.destinationMarker}>
//                   <Ionicons name="location" size={20} color="#FFFFFF" />
//                 </View>
//               </Marker>
//             )}

//           {currentLocation &&
//             serviceRequest &&
//             serviceRequest.locationLatitude &&
//             serviceRequest.locationLongitude && (
//               <MapViewDirections
//                 origin={{
//                   latitude: currentLocation.latitude,
//                   longitude: currentLocation.longitude,
//                 }}
//                 destination={{
//                   latitude: serviceRequest.locationLatitude,
//                   longitude: serviceRequest.locationLongitude,
//                 }}
//                 apikey={GOOGLE_MAPS_API_KEY}
//                 strokeWidth={4}
//                 strokeColor="#FF3B30"
//                 onReady={(result: any) => {
//                   const distanceValue = parseFloat(result.distance);
//                   const formattedDistance = distanceValue.toFixed(2) + " km";
//                   const durationValue = parseFloat(result.duration);
//                   const formattedDuration = durationValue.toFixed(1) + " mins";

//                   setDistance(formattedDistance);
//                   setDuration(formattedDuration);

//                   mapRef.current?.fitToCoordinates(result.coordinates, {
//                     edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//                     animated: true,
//                   });
//                 }}
//               />
//             )}
//         </MapView>
//       </View>

//       <Animated.View style={[styles.infoPanel, { height: animatedHeight }]}>
//         <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
//           <View style={styles.dragHandle} />
//         </View>

//         <ScrollView style={styles.panelScrollView}>
//           <View style={styles.headerSection}>
//             <Text style={styles.heading}>Service Details</Text>
//             <View style={styles.distanceContainer}>
//               <Ionicons name="navigate" size={20} color="#3F63C7" />
//               <Text style={styles.distanceText}>
//                 {distance} ({duration})
//               </Text>
//             </View>
//           </View>

//           {renderRouteOverview()}

//           <View style={styles.detailsContainer}>
//             <Text style={styles.label}>Service Category</Text>
//             <Text style={styles.value}>
//               {serviceRequest?.serviceCategoryName || "N/A"}
//             </Text>
//             <Text style={styles.label}>Services Requested</Text>
//             <Text style={styles.value}>
//               {serviceRequest?.serviceListNames?.join(", ") || "N/A"}
//             </Text>
//             <Text style={styles.label}>Customer</Text>
//             <Text style={styles.value}>
//               {serviceRequest?.customerName || "N/A"}
//             </Text>
//             <Text style={styles.label}>Location</Text>
//             <Text style={styles.value}>
//               {serviceRequest?.locationAddress || "N/A"}
//             </Text>
//             <Text style={styles.label}>Description</Text>
//             <Text style={styles.value}>
//               {serviceRequest?.description || "No additional details"}
//             </Text>
//             <Text style={styles.label}>Your Offer</Text>
//             <Text style={styles.priceValue}>
//               NPR {offerDetails?.offeredPrice || "N/A"}
//             </Text>
//           </View>

//           <View style={styles.buttonContainer}>{renderActionButton()}</View>
//         </ScrollView>
//       </Animated.View>
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
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   dragHandleContainer: {
//     width: "100%",
//     height: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 10,
//   },
//   dragHandle: {
//     width: 40,
//     height: 5,
//     borderRadius: 3,
//     backgroundColor: "#D0D0D0",
//   },
//   panelScrollView: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   headerSection: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//     marginTop: 10,
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
//   routeOverviewContainer: {
//     backgroundColor: "#F9F9F9",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//   },
//   routeEndpointContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 5,
//   },
//   endpointDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#3F63C7",
//     marginRight: 10,
//   },
//   destinationDot: {
//     backgroundColor: "#FF3B30",
//   },
//   routeLine: {
//     width: 2,
//     height: 20,
//     backgroundColor: "#C7C7CC",
//     marginLeft: 5,
//     marginVertical: 2,
//   },
//   currentLocationText: {
//     fontSize: 14,
//     color: "#3F63C7",
//     flex: 1,
//   },
//   destinationText: {
//     fontSize: 14,
//     color: "#FF3B30",
//     flex: 1,
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
//   priceValue: {
//     fontSize: 18,
//     color: "#3F63C7",
//     fontWeight: "600",
//   },
//   buttonContainer: {
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   actionButton: {
//     // Fixed style - was missing in your styles
//     backgroundColor: "#007bff",
//     borderRadius: 12,
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   completeButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   completedContainer: {
//     // Fixed style - was "CompletedContainer" with capital C
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#E8F5E9",
//     borderRadius: 12,
//     padding: 15,
//   },
//   buttonText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   completedText: {
//     // Fixed style - was "CompletedText" with capital C
//     color: "#4CAF50",
//     fontWeight: "600",
//     fontSize: 16,
//     marginLeft: 8,
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
//   stepMarker: {
//     backgroundColor: "rgba(255, 59, 48, 0.8)",
//     borderRadius: 14,
//     width: 28,
//     height: 28,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//   },
//   stepMarkerText: {
//     color: "#FFFFFF",
//     fontWeight: "bold",
//     fontSize: 12,
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
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as ExpoLocation from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  getServiceRequestById,
  updateServiceRequestStatus,
} from "@/store/slice/serviceRequest";
import { getOfferById, updateOfferStatus } from "@/store/slice/serviceOffer";
import { googleMapsService } from "@/store/slice/googleMapsService";
import { useServiceRequestSignalR } from "@/hooks/useServiceRequestSignalR";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyB8s9qKa8kx8AHQU3dXK3xbbKiMCxwNR9Q";

// Panel dimensions
const { height } = Dimensions.get("window");
const PANEL_MIN_HEIGHT = 400;
const PANEL_MAX_HEIGHT = height * 0.6;
const DRAG_THRESHOLD = 50;

export default function ServiceProviderWorkflow() {
  const { offerId, serviceRequestId } = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useSelector((state: RootState) => state.auth);
  const [serviceRequest, setServiceRequest] = useState<any>(null);
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [distance, setDistance] = useState<string>("Calculating...");
  const [duration, setDuration] = useState<string>("Calculating...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const mapRef = useRef<MapView | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);

  // Panel state
  const [panelHeight, setPanelHeight] = useState(PANEL_MIN_HEIGHT);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const lastY = useRef(0);
  const animatedHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;
  const { connected: requestSignalRConnected } = useServiceRequestSignalR(
    undefined,
    serviceRequestId as string
  );

  // Location tracking subscription
  const locationSubscriptionRef = useRef<any>(null);

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

        // Start location tracking after fetching initial data
        await requestLocationPermissionAndStartTracking();
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load required information.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Cleanup function
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
            text: "OK",
            onPress: () => router.replace("/(serviceProvider)/(tab)/home"),
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

  const requestLocationPermissionAndStartTracking = async () => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to show distance to customer."
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
      const result = await googleMapsService.getRouteInfo(
        currentLocation.latitude,
        currentLocation.longitude,
        serviceRequest.locationLatitude,
        serviceRequest.locationLongitude
      );

      if (result) {
        const distanceValue = parseFloat(
          result.distanceMatrix.distance.replace(" km", "")
        );
        const formattedDistance = distanceValue.toFixed(2) + " km";

        const durationValue = parseFloat(
          result.distanceMatrix.duration.replace(" mins", "")
        );
        const formattedDuration = durationValue.toFixed(1) + " mins";

        setDistance(formattedDistance);
        setDuration(formattedDuration);
        setRouteCoordinates(result.polyline);

        if (mapRef.current && result.polyline.length > 0) {
          mapRef.current.fitToCoordinates(result.polyline, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      setDistance("Unavailable");
      setDuration("Unavailable");
    }
  };

  const handleReachedDestination = async () => {
    try {
      // Check if we're already in progress
      if (offerDetails?.status === "In_Progress") return;

      setIsLoading(true);
      if (!offerId) {
        Alert.alert("Error", "Offer information not found");
        return;
      }
      if (!serviceRequestId) {
        Alert.alert("Error", "Request information not found");
        return;
      }

      // Update the offer status
      const response = await dispatch(
        updateOfferStatus({
          offerId: offerId as string,
          status: "In_Progress",
        })
      ).unwrap();

      // Update local state with response
      setOfferDetails({
        ...offerDetails,
        status: "In_Progress",
      });

      Alert.alert("Arrival Confirmed", "You can now begin the service work.");
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletedWork = async () => {
    if (offerDetails?.status === "Completed" || isLoading) return;

    try {
      setIsLoading(true);
      if (!offerId || !serviceRequestId) {
        Alert.alert("Error", "Required information not found");
        return;
      }

      // Update offer status first
      await dispatch(
        updateOfferStatus({
          offerId: offerId as string,
          status: "Completed",
        })
      ).unwrap();

      // Update local state
      setOfferDetails({
        ...offerDetails,
        status: "Completed",
      });

      // Delay for SignalR sync
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Trigger request status update
      await dispatch(
        updateServiceRequestStatus({
          requestId: serviceRequestId as string,
          status: "Completed",
        })
      ).unwrap();

      // Let SignalR handle service request state updates
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
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

  const renderActionButton = () => {
    const status = offerDetails?.status || "Accepted";

    switch (status) {
      case "Accepted":
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReachedDestination}
            disabled={isLoading}
          >
            <Ionicons name="location" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>I've Reached the Destination</Text>
          </TouchableOpacity>
        );
      case "In_Progress":
        return (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompletedWork}
            disabled={isLoading}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>I've Completed the Work</Text>
          </TouchableOpacity>
        );
      case "Completed":
        return (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.completedText}>Work Completed</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F63C7" />
        <Text style={styles.loadingText}>Loading service details...</Text>
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
          {serviceRequest &&
            serviceRequest.locationLatitude &&
            serviceRequest.locationLongitude && (
              <Marker
                coordinate={{
                  latitude: serviceRequest.locationLatitude,
                  longitude: serviceRequest.locationLongitude,
                }}
                title="Customer Location"
                identifier="destination"
              >
                <View style={styles.destinationMarker}>
                  <Ionicons name="location" size={20} color="#FFFFFF" />
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
            <Text style={styles.heading}>Service Details</Text>
            <View style={styles.distanceContainer}>
              <Ionicons name="navigate" size={20} color="#3F63C7" />
              <Text style={styles.distanceText}>
                {distance} ({duration})
              </Text>
            </View>
          </View>

          {renderRouteOverview()}

          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Service Category</Text>
            <Text style={styles.value}>
              {serviceRequest?.serviceCategoryName || "N/A"}
            </Text>
            <Text style={styles.label}>Services Requested</Text>
            <Text style={styles.value}>
              {serviceRequest?.serviceListNames?.join(", ") || "N/A"}
            </Text>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>
              {serviceRequest?.customerName || "N/A"}
            </Text>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>
              {serviceRequest?.locationAddress || "N/A"}
            </Text>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>
              {serviceRequest?.description || "No additional details"}
            </Text>
            <Text style={styles.label}>Your Offer</Text>
            <Text style={styles.priceValue}>
              NPR {offerDetails?.offeredPrice || "N/A"}
            </Text>
          </View>

          <View style={styles.buttonContainer}>{renderActionButton()}</View>
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
  infoPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  dragHandleContainer: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D0D0D0",
  },
  panelScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
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
  routeOverviewContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  routeEndpointContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
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
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#C7C7CC",
    marginLeft: 5,
    marginVertical: 2,
  },
  currentLocationText: {
    fontSize: 14,
    color: "#3F63C7",
    flex: 1,
  },
  destinationText: {
    fontSize: 14,
    color: "#FF3B30",
    flex: 1,
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
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  completedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  completedText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
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
  stepMarker: {
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  stepMarkerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
});
