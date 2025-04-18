import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  Dimensions,
  StyleSheet,
  Animated,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import MapView, { Marker } from "react-native-maps";
import { getServiceRequestById } from "@/store/slice/serviceRequest";

const { height } = Dimensions.get("window");
const PANEL_MIN_HEIGHT = 300;
const PANEL_MAX_HEIGHT = height * 0.5;
const DRAG_THRESHOLD = 50;

export default function AfterRequestService() {
  const dispatch = useDispatch<AppDispatch>();

  const { currentLocation } = useSelector((state: RootState) => state.location);
  const {
    currentRequest,
    serviceRequestId,
    isLoading: requestLoading,
    error: requestError,
  } = useSelector((state: RootState) => state.serviceRequest);

  const [panelHeight, setPanelHeight] = useState(PANEL_MIN_HEIGHT);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const lastY = useRef(0);
  const animatedHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;

  useEffect(() => {
    if (serviceRequestId && !currentRequest) {
      dispatch(getServiceRequestById(serviceRequestId));
    }
  }, [serviceRequestId, currentRequest, dispatch]);

  useEffect(() => {
    if (requestError) {
      Alert.alert("Error", requestError);
    }
  }, [requestError]);

  useEffect(() => {
    animatedHeight.addListener(({ value }) => {
      setPanelHeight(value);
    });
    return () => {
      animatedHeight.removeAllListeners();
    };
  }, []);

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

  const handleCancelRequest = () => {
    if (!serviceRequestId) {
      Alert.alert("Error", "No service request found to cancel");
      return;
    }

    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this service request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            // dispatch(cancelServiceRequest(serviceRequestId))
            //   .unwrap()
            //   .then(() => {
            //     Alert.alert(
            //       "Success",
            //       "Service request cancelled successfully"
            //     );
            //     router.replace("/");
            //   })
            //   .catch((error: any) => {
            //     Alert.alert("Error", error);
            //   });
            router.replace("/(tabs)/home");
          },
        },
      ]
    );
  };

  const getSelectedServicesText = () => {
    if (
      !currentRequest ||
      !currentRequest.serviceListNames ||
      currentRequest.serviceListNames.length === 0
    ) {
      return "No services selected";
    }

    return currentRequest.serviceListNames.join(", ");
  };

  console.log(currentRequest);
  if (requestLoading && !currentRequest) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F8C52B" />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          scrollEnabled
          zoomEnabled
        >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
            />
          )}
        </MapView>
      </View>

      <View style={styles.panel}>
        <Animated.View style={{ height: animatedHeight }}>
          <View
            style={styles.dragHandleContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandle} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.panelContent}
            keyboardVerticalOffset={40}
          >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {requestLoading ? (
                <ActivityIndicator size="large" color="#F8C52B" />
              ) : (
                <>
                  <Text style={styles.panelTitle}>Service Request Details</Text>

                  <Text style={styles.label}>Selected Services</Text>
                  <View style={[styles.input, styles.readOnlyField]}>
                    <Text style={styles.inputText}>
                      {getSelectedServicesText()}
                    </Text>
                  </View>

                  <Text style={[styles.label, { marginTop: 16 }]}>
                    Additional Details
                  </Text>
                  <View style={[styles.textArea, styles.readOnlyField]}>
                    <Text style={styles.inputText}>
                      {currentRequest?.description ||
                        "No additional details provided"}
                    </Text>
                  </View>

                  <View style={styles.sectionDivider} />

                  {/* <Text style={styles.statusLabel}>Status</Text>
                  <View style={styles.statusContainer}>
                    <Ionicons name="time-outline" size={20} color="#F8C52B" />
                    <Text style={styles.statusValue}>
                      Waiting for service provider
                    </Text>
                  </View> */}

                  <View style={styles.cancelButtonContainer}>
                    <View style={styles.buttonWrapper}>
                      <Text style={styles.buttonHelperText}>
                        Need to make changes or cancel?
                      </Text>
                      <View
                        style={styles.cancelButton}
                        onTouchEnd={handleCancelRequest}
                      >
                        <Text style={styles.cancelButtonText}>
                          Cancel Request
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// Add the cancelServiceRequest thunk to serviceRequest.ts slice
// export const cancelServiceRequest = createAsyncThunk(
//   "serviceRequest/cancel",
//   async (requestId: string, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await getAxiosInstance().delete(
//         `/serviceRequest/${requestId}`
//       );
//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data ||
//           response.data.message ||
//           "Failed to cancel service request";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }
//
//       dispatch(setMessage({ data: "Service request cancelled successfully!" }));
//       return response.data;
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to cancel service request";
//
//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#808080",
  },
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    flex: 1,
  },
  statusBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
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
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D0D0D0",
  },
  panelContent: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  label: {
    marginBottom: 8,
    color: "#808080",
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  readOnlyField: {
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 20,
  },
  statusLabel: {
    marginBottom: 8,
    color: "#808080",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F8C52B",
  },
  statusValue: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  cancelButtonContainer: {
    marginTop: 24,
  },
  buttonWrapper: {
    alignItems: "center",
  },
  buttonHelperText: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 8,
  },
  cancelButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF5252",
    borderWidth: 1,
    borderColor: "#FF5252",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
