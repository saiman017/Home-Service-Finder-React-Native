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
import {
  getServiceRequestById,
  cancelServiceRequest,
  resetServiceRequestState,
  clearServiceRequestData,
  updateServiceRequestStatus,
} from "@/store/slice/serviceRequest";
import {
  getOffersByRequestId,
  acceptOffer,
  rejectOffer,
} from "@/store/slice/serviceOffer";
import OfferNotification from "@/components/Notification";
import { useServiceRequestSignalR } from "@/hooks/useServiceRequestSignalR";
import { useServiceOfferSignalR } from "@/hooks/useServiceOfferSignalR";
import { Image } from "react-native";

const { height } = Dimensions.get("window");
const PANEL_MIN_HEIGHT = 400;
const PANEL_MAX_HEIGHT = height * 0.6;
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
  const { offers, isLoading: offersLoading } = useSelector(
    (state: RootState) => state.serviceOffer
  );
  const { userId } = useSelector((state: RootState) => state.auth);

  const [panelHeight, setPanelHeight] = useState(PANEL_MIN_HEIGHT);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [processedOfferIds, setProcessedOfferIds] = useState<string[]>([]);
  const lastY = useRef(0);
  const animatedHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;

  // Initialize SignalR connection for this specific request
  const { connected: signalRConnected } = useServiceRequestSignalR(
    undefined,
    serviceRequestId || currentRequest?.id
  );

  const { connected: offerSignalRConnected } = useServiceOfferSignalR(
    undefined, // No provider ID since we're the customer
    serviceRequestId || currentRequest?.id
  );

  useEffect(() => {
    console.log("Request SignalR connection:", signalRConnected);
    console.log("Offer SignalR connection:", offerSignalRConnected);
  }, [signalRConnected, offerSignalRConnected]);

  // useEffect(() => {
  //   const requestId = serviceRequestId || currentRequest?.id;

  //   if (requestId) {
  //     // Get the request details
  //     dispatch(getServiceRequestById(requestId));

  //     // Check for offers
  //     dispatch(getOffersByRequestId(requestId));

  //     // Only set up polling if SignalR is not connected
  //     if (!signalRConnected) {
  //       const intervalId = setInterval(() => {
  //         dispatch(getOffersByRequestId(requestId));
  //         dispatch(getServiceRequestById(requestId)); // Also refresh request status
  //       }, 10000); // Poll every 10 seconds

  //       return () => clearInterval(intervalId);
  //     }
  //   }
  // }, [serviceRequestId, currentRequest?.id, dispatch, signalRConnected]);

  useEffect(() => {
    const requestId = serviceRequestId || currentRequest?.id;

    if (requestId) {
      // Initial data load
      dispatch(getServiceRequestById(requestId));
      dispatch(getOffersByRequestId(requestId));

      // Only set up polling if SignalR is not connected
      if (!signalRConnected || !offerSignalRConnected) {
        console.log("Setting up polling since SignalR is not connected");
        const intervalId = setInterval(() => {
          dispatch(getOffersByRequestId(requestId));
          dispatch(getServiceRequestById(requestId));
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(intervalId);
      } else {
        console.log("Using SignalR for real-time updates");
      }
    }
  }, [
    serviceRequestId,
    currentRequest?.id,
    dispatch,
    signalRConnected,
    offerSignalRConnected,
  ]);

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

  // Handle request status changes (including cancellation)
  useEffect(() => {
    if (
      currentRequest &&
      (currentRequest.status === "Expired" ||
        currentRequest.status === "CANCELLED")
    ) {
      Alert.alert(
        "Request Status",
        `This service request is ${currentRequest.status.toLowerCase()}.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)/home");
              dispatch(resetServiceRequestState());
              dispatch(clearServiceRequestData());
            },
          },
        ]
      );
    }
  }, [currentRequest, dispatch]);

  const handleAcceptOffer = (offerId: string) => {
    if (!userId) {
      Alert.alert("Error", "User information not found");
      return;
    }

    Alert.alert("Accept Offer", "Are you sure you want to accept this offer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        style: "default",
        onPress: () => {
          setProcessedOfferIds((prev) => [...prev, offerId]);

          dispatch(
            acceptOffer({
              offerId,
              customerId: userId,
            })
          )
            .unwrap()
            .then(() => {
              Alert.alert(
                "Success",
                "Offer accepted! The service provider has been notified.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.replace({
                        pathname:
                          "/(users)/(RequestService)/CustomerProviderRequestDetails",
                        params: {
                          offerId: offerId,
                          serviceRequestId:
                            serviceRequestId || currentRequest?.id,
                        },
                      });
                    },
                  },
                ]
              );
            })
            .catch((error) => {
              const errorMessage =
                typeof error === "string"
                  ? error
                  : error?.message || "An unexpected error occurred";
              Alert.alert("Error", errorMessage);
              setProcessedOfferIds((prev) =>
                prev.filter((id) => id !== offerId)
              );
            });
        },
      },
    ]);
  };

  const handleDeclineOffer = (offerId: string) => {
    if (!userId) {
      Alert.alert("Error", "User information not found");
      return;
    }

    Alert.alert(
      "Decline Offer",
      "Are you sure you want to decline this offer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            setProcessedOfferIds((prev) => [...prev, offerId]);

            dispatch(
              rejectOffer({
                offerId,
                customerId: userId,
              })
            )
              .unwrap()
              .then(() => {
                Alert.alert("Success", "Offer declined", [
                  {
                    text: "OK",
                    onPress: () => {
                      if (serviceRequestId) {
                        dispatch(getOffersByRequestId(serviceRequestId));
                      }
                    },
                  },
                ]);
              })
              .catch((error) => {
                const errorMessage =
                  typeof error === "string"
                    ? error
                    : error?.message || "An unexpected error occurred";
                Alert.alert("Error", errorMessage);
                setProcessedOfferIds((prev) =>
                  prev.filter((id) => id !== offerId)
                );
              });
          },
        },
      ]
    );
  };

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
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this service request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            const requestId = currentRequest?.id;
            const customerId = currentRequest?.customerId;

            if (!customerId || !requestId) {
              Alert.alert("Error", "Request information not found");
              return;
            }

            dispatch(
              cancelServiceRequest({
                requestId,
                customerId,
              })
            )
              .unwrap()
              .then(() => {
                Alert.alert(
                  "Success",
                  "Service request Cancelled successfully",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Clear all request data before navigating
                        dispatch(resetServiceRequestState());
                        dispatch(clearServiceRequestData());
                        router.replace("/(tabs)/home");
                      },
                    },
                  ]
                );
              })
              .catch((error: any) => {
                const errorMessage =
                  typeof error === "string"
                    ? error
                    : error?.message || "An unexpected error occurred";
                Alert.alert("Error", errorMessage);
              });
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

  // Find pending offers that should be displayed as notifications
  // Filter out any offers that have been processed (accepted/declined)
  const pendingOffers =
    offers?.filter(
      (offer) =>
        offer.status === "Pending" && !processedOfferIds.includes(offer.id)
    ) || [];

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

      {/* Render offer notifications - only show the most recent one */}
      {pendingOffers.length > 0 && (
        <OfferNotification
          serviceOfferData={pendingOffers[0]}
          onAccept={handleAcceptOffer}
          onDecline={handleDeclineOffer}
        />
      )}

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

                  {currentRequest?.serviceRequestImagePaths &&
                    currentRequest.serviceRequestImagePaths.length > 0 && (
                      <>
                        <Text style={[styles.label, { marginTop: 16 }]}>
                          Uploaded Images
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          {currentRequest.serviceRequestImagePaths.map(
                            (imageUri, index) => (
                              <View key={index} style={styles.imageContainer}>
                                <Image
                                  source={{
                                    uri: `http://10.0.2.2:5039${imageUri}`,
                                  }}
                                  style={styles.image}
                                  resizeMode="cover"
                                />
                              </View>
                            )
                          )}
                        </ScrollView>
                      </>
                    )}

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

                  <View style={styles.statusContainer}>
                    <Ionicons
                      name={
                        currentRequest?.status === "Expired" ||
                        currentRequest?.status === "Cancelled"
                          ? "alert-circle-outline"
                          : pendingOffers.length > 0
                          ? "checkmark-circle-outline"
                          : "time-outline"
                      }
                      size={20}
                      color={
                        currentRequest?.status === "Expired" ||
                        currentRequest?.status === "Cancelled"
                          ? "#FF6B6B"
                          : pendingOffers.length > 0
                          ? "#4CAF50"
                          : "#F8C52B"
                      }
                    />
                    <Text
                      style={[
                        styles.statusValue,
                        currentRequest?.status === "Expired" ||
                        currentRequest?.status === "Cancelled"
                          ? styles.statusValue
                          : {},
                      ]}
                    >
                      {currentRequest?.status === "Expired"
                        ? "This request has expired"
                        : currentRequest?.status === "Cancelled"
                        ? "This request has been Cancelled"
                        : pendingOffers.length > 0
                        ? `You have ${pendingOffers.length} offer(s) from service providers!`
                        : "Waiting for service provider"}
                    </Text>
                  </View>

                  {pendingOffers.length > 1 && (
                    <Text style={styles.multipleOffersNote}>
                      Pull up to see all available offers
                    </Text>
                  )}

                  {currentRequest?.status !== "Expired" &&
                    currentRequest?.status !== "Cancelled" && (
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
                    )}
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F8C52B",
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dedede",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  statusValue: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  multipleOffersNote: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#F8C52B",
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
