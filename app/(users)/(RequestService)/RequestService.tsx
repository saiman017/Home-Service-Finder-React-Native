// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Platform,
//   KeyboardAvoidingView,
//   SafeAreaView,
//   Alert,
//   Dimensions,
//   StyleSheet,
//   Animated,
//   PanResponder,
//   ActivityIndicator,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store/store";
// import MapView, { Marker } from "react-native-maps";
// import { fetchServiceListByCategory } from "@/store/slice/serviceList";
// import { createServiceRequest, resetServiceRequestState, uploadServiceRequestImages, getServiceRequestById } from "@/store/slice/serviceRequest";
// import { useServiceRequestSignalR } from "@/hooks/useServiceRequestSignalR";
// import * as ImagePicker from "expo-image-picker";
// import { Image } from "react-native";

// const { height } = Dimensions.get("window");
// const PANEL_MIN_HEIGHT = 400;
// const PANEL_MAX_HEIGHT = height * 0.6;
// const DRAG_THRESHOLD = 50;

// export default function ServiceRequestScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const params = useLocalSearchParams();
//   const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";

//   const { currentLocation } = useSelector((state: RootState) => state.location);
//   const { servicesByCategory, loading: servicesLoading, error: servicesError } = useSelector((state: RootState) => state.serviceList);
//   const { isLoading: requestLoading, error: requestError, success: requestSuccess, currentRequest } = useSelector((state: RootState) => state.serviceRequest);
//   const { userId } = useSelector((state: RootState) => state.auth);

//   // Initialize with an empty array since we'll allow removing images
//   const [selectedImages, setSelectedImages] = useState<string[]>([]);

//   // ✅ Use SignalR hook for real-time updates
//   useServiceRequestSignalR(categoryId, currentRequest?.id);

//   const [panelHeight, setPanelHeight] = useState(PANEL_MIN_HEIGHT);
//   const [isPanelExpanded, setIsPanelExpanded] = useState(false);
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [serviceDescription, setServiceDescription] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   const lastY = useRef(0);
//   const animatedHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;

//   useEffect(() => {
//     if (categoryId) {
//       dispatch(fetchServiceListByCategory(categoryId));
//     }

//     return () => {
//       dispatch(resetServiceRequestState());
//     };
//   }, [categoryId, dispatch]);

//   useEffect(() => {
//     if (requestSuccess) {
//       Alert.alert("Success", "Service request submitted successfully!");
//       setSelectedServices([]);
//       setServiceDescription("");
//       router.replace("/AfterRequestService");
//     }
//   }, [requestSuccess, dispatch]);

//   useEffect(() => {
//     if (requestError) {
//       Alert.alert("Error", requestError);
//       dispatch(resetServiceRequestState());
//     }
//   }, [requestError, dispatch]);

//   useEffect(() => {
//     animatedHeight.addListener(({ value }) => {
//       setPanelHeight(value);
//     });
//     return () => {
//       animatedHeight.removeAllListeners();
//     };
//   }, []);

//   const mapRegion = currentLocation
//     ? {
//         latitude: currentLocation.latitude,
//         longitude: currentLocation.longitude,
//         latitudeDelta: 0.005,
//         longitudeDelta: 0.005,
//       }
//     : {
//         latitude: 27.7172,
//         longitude: 85.324,
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       };

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderGrant: () => {
//         lastY.current = 0;
//       },
//       onPanResponderMove: (_, gesture) => {
//         const dy = gesture.dy - lastY.current;
//         lastY.current = gesture.dy;

//         const newHeight = Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_MAX_HEIGHT, panelHeight - dy));
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
//           const toValue = panelHeight > (PANEL_MIN_HEIGHT + PANEL_MAX_HEIGHT) / 2 ? PANEL_MAX_HEIGHT : PANEL_MIN_HEIGHT;

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

//   const pickImages = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const uris = result.assets.map((asset) => asset.uri);
//       setSelectedImages((prev) => [...prev, ...uris]);
//     }
//   };

//   // New function to remove an image from the selected images array
//   const removeImage = (indexToRemove: number) => {
//     setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
//   };

//   const toggleService = (serviceId: string) => {
//     setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]));
//     setShowDropdown(false);
//   };

//   const getSelectedServicesText = () => {
//     if (selectedServices.length === 0) return "Select services";
//     return servicesByCategory
//       .filter((service) => selectedServices.includes(service.id))
//       .map((service) => service.name)
//       .join(", ");
//   };

//   const findService = async () => {
//     if (!userId) {
//       Alert.alert("Error", "You must be logged in to request services");
//       return;
//     }
//     if (selectedServices.length === 0) {
//       Alert.alert("Error", "Please select at least one service");
//       return;
//     }
//     if (!currentLocation) {
//       Alert.alert("Error", "Location data is required");
//       return;
//     }

//     const requestPayload = {
//       customerId: userId,
//       locationId: userId,
//       serviceCategoryId: categoryId,
//       description: serviceDescription.trim(),
//       serviceListIds: selectedServices,
//     };

//     const result = await dispatch(createServiceRequest(requestPayload));

//     if (createServiceRequest.fulfilled.match(result)) {
//       const requestId = result.payload.data;

//       // Upload images if any
//       if (selectedImages.length > 0) {
//         const files = selectedImages.map((uri) => {
//           const name = uri.split("/").pop() || "image.jpg";
//           const type = "image/jpeg";
//           return { uri, name, type };
//         });

//         await dispatch(uploadServiceRequestImages({ requestId, files }));

//         // ✅ Refetch the updated request to get the images
//         await dispatch(getServiceRequestById(requestId));
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.mapContainer}>
//         <MapView style={styles.map} region={mapRegion} scrollEnabled zoomEnabled>
//           {currentLocation && (
//             <Marker
//               coordinate={{
//                 latitude: currentLocation.latitude,
//                 longitude: currentLocation.longitude,
//               }}
//             />
//           )}
//         </MapView>

//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.panel}>
//         <Animated.View style={{ height: animatedHeight }}>
//           <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
//             <View style={styles.dragHandle} />
//           </View>

//           <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.panelContent} keyboardVerticalOffset={40}>
//             <ScrollView contentContainerStyle={styles.scrollViewContent}>
//               {servicesLoading ? (
//                 <ActivityIndicator size="large" color="#3F63C7" />
//               ) : servicesError ? (
//                 <Text>Failed to load services. Please try again.</Text>
//               ) : (
//                 <>
//                   <Text style={styles.label}>Select Services</Text>
//                   <View style={styles.dropdownContainer}>
//                     <TouchableOpacity style={[styles.input, styles.selectContainer]} onPress={() => setShowDropdown(!showDropdown)}>
//                       <Text style={selectedServices.length > 0 ? styles.inputText : styles.placeholderText} numberOfLines={1}>
//                         {getSelectedServicesText()}
//                       </Text>
//                       <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#808080" />
//                     </TouchableOpacity>

//                     {showDropdown && (
//                       <View style={styles.dropdownList}>
//                         {servicesByCategory.map((service) => (
//                           <TouchableOpacity key={service.id} style={styles.dropdownItem} onPress={() => toggleService(service.id)}>
//                             <Text style={[styles.dropdownItemText, selectedServices.includes(service.id) && styles.selectedItemText]}>
//                               {service.name.charAt(0).toUpperCase() + service.name.slice(1).toLowerCase()}
//                             </Text>
//                             {selectedServices.includes(service.id) && <Ionicons name="checkmark" size={16} color="#3F63C7" />}
//                           </TouchableOpacity>
//                         ))}
//                       </View>
//                     )}
//                   </View>

//                   <Text style={[styles.label, { marginTop: 16 }]}>Additional Details (Optional)</Text>
//                   <TextInput
//                     style={styles.textArea}
//                     placeholder="Describe your issue in detail..."
//                     multiline
//                     numberOfLines={4}
//                     value={serviceDescription}
//                     onChangeText={setServiceDescription}
//                     textAlignVertical="top"
//                   />

//                   <Text style={[styles.label, { marginTop: 16 }]}>Upload Images (Max 6)</Text>

//                   <TouchableOpacity style={styles.uploadButton} onPress={pickImages} disabled={selectedImages.length >= 6}>
//                     <View style={styles.uploadPlaceholder}>
//                       <Ionicons name="image-outline" size={24} color="#808080" />
//                       <Text style={styles.uploadText}>{selectedImages.length >= 6 ? "Max images uploaded" : "Tap to upload images"}</Text>
//                     </View>
//                   </TouchableOpacity>

//                   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
//                     {selectedImages.map((uri, index) => (
//                       <View key={index} style={styles.imageContainer}>
//                         <Image source={{ uri }} style={styles.previewImage} />
//                         <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
//                           <Ionicons name="close-circle" size={22} color="#ff3b30" />
//                         </TouchableOpacity>
//                       </View>
//                     ))}
//                   </ScrollView>

//                   <TouchableOpacity style={styles.findButton} onPress={findService} disabled={requestLoading}>
//                     {requestLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.findButtonText}>Find Service</Text>}
//                   </TouchableOpacity>
//                 </>
//               )}
//             </ScrollView>
//           </KeyboardAvoidingView>
//         </Animated.View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   mapContainer: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   map: {
//     flex: 1,
//   },
//   backButton: {
//     position: "absolute",
//     top: 16,
//     left: 16,
//     backgroundColor: "white",
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   panel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 8,
//     overflow: "hidden",
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
//   panelContent: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollViewContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 15,
//   },
//   formSection: {
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//   },
//   label: {
//     marginBottom: 8,
//     color: "#808080",
//     fontWeight: "500",
//   },
//   input: {
//     height: 48,
//     borderWidth: 1,
//     borderColor: "#dedede",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     backgroundColor: "#ffffff",
//   },
//   inputText: {
//     fontSize: 16,
//     color: "#000",
//   },
//   placeholderText: {
//     fontSize: 16,
//     color: "#9e9e9e",
//   },
//   uploadButton: {
//     height: 100,
//     borderWidth: 1,
//     borderColor: "#dedede",
//     borderRadius: 10,
//     overflow: "hidden",
//     marginBottom: 10,
//   },
//   uploadPlaceholder: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F9F9F9",
//   },
//   uploadText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: "#808080",
//   },
//   imagesScrollView: {
//     marginTop: 15,
//     flexGrow: 0,
//   },
//   imageContainer: {
//     position: "relative",
//     marginRight: 10,
//   },
//   previewImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//   },
//   removeImageButton: {
//     position: "absolute",
//     top: -8,
//     right: -8,
//     backgroundColor: "white",
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
//   },
//   textArea: {
//     height: 80,
//     borderWidth: 1,
//     borderColor: "#dedede",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingTop: 12,
//     backgroundColor: "#ffffff",
//     textAlignVertical: "top",
//   },
//   findButton: {
//     height: 55,
//     backgroundColor: "#3F63C7",
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 30,
//     marginBottom: 20,
//   },
//   findButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   dropdownContainer: {
//     position: "relative",
//     zIndex: 1000,
//   },
//   selectContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   dropdownList: {
//     position: "absolute",
//     top: 48,
//     left: 0,
//     right: 0,
//     backgroundColor: "white",
//     borderWidth: 1,
//     borderColor: "#dedede",
//     borderRadius: 10,
//     marginTop: 4,
//     zIndex: 1000,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     maxHeight: 200,
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f5f5f5",
//   },
//   dropdownItemText: {
//     fontSize: 16,
//     color: "#000",
//   },
//   selectedItemText: {
//     color: "#3F63C7",
//     fontWeight: "500",
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 24,
//     backgroundColor: "#fff",
//   },
// });
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  Dimensions,
  StyleSheet,
  Animated,
  PanResponder,
  ActivityIndicator,
  Image,
  Pressable, // <-- import Pressable
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { fetchServiceListByCategory } from "@/store/slice/serviceList";
import { createServiceRequest, resetServiceRequestState, uploadServiceRequestImages, getServiceRequestById } from "@/store/slice/serviceRequest";
import { useServiceRequestSignalR } from "@/hooks/useServiceRequestSignalR";
import type { AppDispatch, RootState } from "@/store/store";

const { height } = Dimensions.get("window");
const PANEL_MIN_HEIGHT = 400;
const PANEL_MAX_HEIGHT = height * 0.6;
const DRAG_THRESHOLD = 50;

export default function ServiceRequestScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useLocalSearchParams();
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";

  const { currentLocation } = useSelector((s: RootState) => s.location);
  const { servicesByCategory, loading: servicesLoading, error: servicesError } = useSelector((s: RootState) => s.serviceList);
  const { isLoading: requestLoading, error: requestError, success: requestSuccess, currentRequest } = useSelector((s: RootState) => s.serviceRequest);
  const { userId } = useSelector((s: RootState) => s.auth);

  // form state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceDescription, setServiceDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // field‐level errors
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);

  // panel animation
  const [panelHeight, setPanelHeight] = useState(PANEL_MIN_HEIGHT);
  const animatedHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;
  const lastY = useRef(0);

  // dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  // SignalR
  useServiceRequestSignalR(categoryId, currentRequest?.id);

  // fetch on mount
  useEffect(() => {
    if (categoryId) dispatch(fetchServiceListByCategory(categoryId));
    return () => {
      dispatch(resetServiceRequestState());
    };
  }, [categoryId, dispatch]);

  // on success navigate
  useEffect(() => {
    if (requestSuccess) {
      Alert.alert("Success", "Service request submitted successfully!");
      setSelectedServices([]);
      setServiceDescription("");
      router.replace("/AfterRequestService");
    }
  }, [requestSuccess]);

  // on error alert
  useEffect(() => {
    if (requestError) {
      Alert.alert("Error", requestError);
      dispatch(resetServiceRequestState());
    }
  }, [requestError, dispatch]);

  // sync panel height into state
  useEffect(() => {
    animatedHeight.addListener(({ value }) => setPanelHeight(value));
    return () => {
      animatedHeight.removeAllListeners();
    };
  }, [animatedHeight]);

  // pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastY.current = 0;
      },
      onPanResponderMove: (_, g) => {
        const dy = g.dy - lastY.current;
        lastY.current = g.dy;
        const newH = Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_MAX_HEIGHT, panelHeight - dy));
        animatedHeight.setValue(newH);
      },
      onPanResponderRelease: (_, g) => {
        const shouldExpand = g.dy < -DRAG_THRESHOLD;
        const shouldCollapse = g.dy > DRAG_THRESHOLD;
        let toValue = panelHeight > (PANEL_MIN_HEIGHT + PANEL_MAX_HEIGHT) / 2 ? PANEL_MAX_HEIGHT : PANEL_MIN_HEIGHT;
        if (shouldExpand) toValue = PANEL_MAX_HEIGHT;
        if (shouldCollapse) toValue = PANEL_MIN_HEIGHT;
        Animated.spring(animatedHeight, {
          toValue,
          useNativeDriver: false,
          friction: 7,
        }).start();
      },
    })
  ).current;

  // helper
  const getSelectedServicesText = () => {
    if (!selectedServices.length) return "Select services";
    return servicesByCategory
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => s.name)
      .join(", ");
  };

  // toggle service
  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    // clear error if now >0
    if (selectedServices.length + (selectedServices.includes(id) ? -1 : 1) > 0) {
      setServiceError(null);
    }
    setShowDropdown(false);
  };

  // image picker
  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!res.canceled) {
      const uris = res.assets.map((a) => a.uri);
      setSelectedImages((p) => [...p, ...uris].slice(0, 6));
      if (uris.length) setImagesError(null);
    }
  };

  // remove image
  const removeImage = (idx: number) => setSelectedImages((p) => p.filter((_, i) => i !== idx));

  // submit
  const findService = async () => {
    // reset
    setServiceError(null);
    setDescriptionError(null);
    setImagesError(null);
    let hasError = false;

    if (!selectedServices.length) {
      setServiceError("Please select at least one service");
      hasError = true;
    }
    if (!serviceDescription.trim()) {
      setDescriptionError("Please describe your problem");
      hasError = true;
    }
    if (!selectedImages.length) {
      setImagesError("Please upload at least one image");
      hasError = true;
    } else if (selectedImages.length > 6) {
      setImagesError("You can upload up to 6 images only");
      hasError = true;
    }

    if (hasError) return;

    if (!userId) {
      Alert.alert("Error", "You must be logged in to request services");
      return;
    }
    if (!currentLocation) {
      Alert.alert("Error", "Location data is required");
      return;
    }

    const payload = {
      customerId: userId,
      locationId: userId,
      serviceCategoryId: categoryId,
      description: serviceDescription.trim(),
      serviceListIds: selectedServices,
    };
    const result = await dispatch(createServiceRequest(payload));
    if (createServiceRequest.fulfilled.match(result)) {
      const reqId = result.payload.data;
      if (selectedImages.length) {
        const files = selectedImages.map((uri) => ({
          uri,
          name: uri.split("/").pop()!,
          type: "image/jpeg",
        }));
        await dispatch(uploadServiceRequestImages({ requestId: reqId, files }));
        await dispatch(getServiceRequestById(reqId));
      }
    }
  };

  // map region
  const mapRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: 27.7172,
        longitude: 85.324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map & back */}
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={mapRegion}>
          {currentLocation && <Marker coordinate={currentLocation as any} />}
        </MapView>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Bottom panel */}
      <View style={styles.panel}>
        <Animated.View style={{ height: animatedHeight }}>
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.panelContent}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {/* Select Services */}
              <Text style={styles.label}>Select Services</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity style={[styles.input, styles.selectContainer, serviceError && styles.inputError]} onPress={() => setShowDropdown(true)}>
                  <Text style={selectedServices.length ? styles.inputText : styles.placeholderText} numberOfLines={1}>
                    {getSelectedServicesText()}
                  </Text>
                  <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#808080" />
                </TouchableOpacity>
                {serviceError && <Text style={styles.errorText}>{serviceError}</Text>}

                {showDropdown && (
                  <>
                    {/* full-screen catch-all */}
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDropdown(false)} />
                    <View style={styles.dropdownList}>
                      {servicesByCategory.map((svc) => (
                        <TouchableOpacity key={svc.id} style={styles.dropdownItem} onPress={() => toggleService(svc.id)}>
                          <Text style={[styles.dropdownItemText, selectedServices.includes(svc.id) && styles.selectedItemText]}>{svc.name}</Text>
                          {selectedServices.includes(svc.id) && <Ionicons name="checkmark" size={16} color="#3F63C7" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>

              {/* Description */}
              <Text style={[styles.label, { marginTop: 16 }]}>Additional Details</Text>
              <TextInput
                style={[styles.textArea, descriptionError && styles.inputError]}
                placeholder="Describe your issue..."
                multiline
                numberOfLines={4}
                value={serviceDescription}
                onChangeText={(t) => {
                  setServiceDescription(t);
                  if (t.trim()) setDescriptionError(null);
                }}
              />
              {descriptionError && <Text style={styles.errorText}>{descriptionError}</Text>}

              {/* Images */}
              <Text style={[styles.label, { marginTop: 16 }]}>Upload Images (1–6)</Text>
              <TouchableOpacity style={[styles.uploadButton, imagesError && styles.inputError]} onPress={pickImages} disabled={selectedImages.length >= 6}>
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#808080" />
                  <Text style={styles.uploadText}>{selectedImages.length ? `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""}` : "Tap to upload"}</Text>
                </View>
              </TouchableOpacity>
              {imagesError && <Text style={styles.errorText}>{imagesError}</Text>}

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
                {selectedImages.map((uri, idx) => (
                  <View key={idx} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(idx)}>
                      <Ionicons name="close-circle" size={22} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Submit */}
              <TouchableOpacity style={styles.findButton} onPress={findService} disabled={requestLoading}>
                {requestLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.findButtonText}>Find Service</Text>}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  mapContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  map: { flex: 1 },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
    overflow: "hidden",
  },
  dragHandleContainer: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  dragHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: "#D0D0D0" },
  panelContent: { flex: 1 },
  scrollViewContent: { paddingBottom: 20, paddingHorizontal: 15 },

  label: { marginBottom: 8, color: "#808080", fontWeight: "500" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  selectContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inputText: { fontSize: 16, color: "#000" },
  placeholderText: { fontSize: 16, color: "#9e9e9e" },

  dropdownContainer: { position: "relative", zIndex: 1000 },
  dropdownList: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    marginTop: 4,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownItemText: { fontSize: 16, color: "#000" },
  selectedItemText: { color: "#3F63C7", fontWeight: "500" },

  textArea: {
    height: 80,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },

  uploadButton: { height: 100, borderWidth: 1, borderColor: "#dedede", borderRadius: 10, overflow: "hidden", marginBottom: 10 },
  uploadPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9F9F9" },
  uploadText: { marginTop: 8, fontSize: 14, color: "#808080" },

  imagesScrollView: { marginTop: 15, flexGrow: 0 },
  imageContainer: { position: "relative", marginRight: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },

  findButton: { height: 55, backgroundColor: "#3F63C7", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 30, marginBottom: 20 },
  findButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  /* error styling */
  inputError: { borderColor: "#ff4d4f" },
  errorText: { color: "#ff4d4f", marginTop: 4, fontSize: 12 },
});
