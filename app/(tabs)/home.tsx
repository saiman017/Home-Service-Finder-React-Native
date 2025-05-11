import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar, ActivityIndicator, Alert, Dimensions, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchServiceCategories, setSelectedCategoryId } from "@/store/slice/serviceCategory";
import { AppDispatch, RootState } from "@/store/store";
import { fetchLocation } from "@/store/slice/location";
import { getActiveRequestsByCustomerId, getPendingRequestsByCustomerId, getServiceRequestById, getRequestsByCustomerId } from "@/store/slice/serviceRequest";
import { fetchUserById, selectUserById } from "@/store/slice/user";
import { getOffersByRequestId } from "@/store/slice/serviceOffer";
import { formatToNepalTime } from "@/utils/formattoNepalTime";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");
const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

interface FeatureSlide {
  id: string;
  image?: any;
  backgroundImage?: any;
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  highlightedText?: string;
  fetaureText?: string;
}

const featureSlides: FeatureSlide[] = [
  {
    id: "1",
    backgroundImage: require("@/assets/images/features/reapir.png"),
    title: "",
    subtitle: "",
    highlightedText: "",
    fetaureText: "",
  },
  {
    id: "2",
    backgroundImage: require("@/assets/images/features/Rimberio2.png"),
  },
  {
    id: "3",
    backgroundImage: require("@/assets/images/features/2.png"),
  },
];

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading, error } = useSelector((state: RootState) => state.serviceCategory);
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { userId } = useSelector((state: RootState) => state.auth);
  const { customerRequests } = useSelector((state: RootState) => state.serviceRequest);
  const currentUser = useSelector(selectUserById) || null;

  // For carousel
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList<FeatureSlide>>(null);

  // Filter completed and expired requests for history data
  const historyRequests = customerRequests
    .filter((request) => request.status === "Completed" || request.status === "Expired")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2); // Get only the 2 most recent history items

  useEffect(() => {
    dispatch(fetchServiceCategories());
    if (userId) {
      dispatch(fetchUserById(userId));
      dispatch(fetchLocation(userId));
      dispatch(getRequestsByCustomerId(userId)); // Fetch all requests for history data
    }
  }, [dispatch, userId]);

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSlideIndex === featureSlides.length - 1) {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      } else {
        flatListRef.current?.scrollToIndex({
          index: activeSlideIndex + 1,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSlideIndex]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setActiveSlideIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const goToProfile = () => {
    router.push("/(users)/userProfile");
  };

  const goToLocationSelect = () => {
    router.push("/(users)/(location)/setAddress");
  };

  const navigateToService = async (categoryId: string, categoryName: string) => {
    try {
      if (userId) {
        // Check pending request
        const pendingRequest = await dispatch(getPendingRequestsByCustomerId(userId)).unwrap();

        if (pendingRequest && pendingRequest.id) {
          await dispatch(getServiceRequestById(pendingRequest.id)).unwrap();
          router.push("/AfterRequestService");
          return;
        }

        // Check active requests (array)
        const activeRequest = await dispatch(getActiveRequestsByCustomerId(userId)).unwrap();

        console.log("activeRequest", activeRequest);

        if (activeRequest && activeRequest.length > 0) {
          const active = activeRequest[0];
          console.log("Active Request ID:", active.id);

          await dispatch(getServiceRequestById(active.id)).unwrap();

          const offers = await dispatch(getOffersByRequestId(active.id)).unwrap();

          const acceptedOffer = offers.find((offer: any) => offer.status === "Accepted");

          if (acceptedOffer) {
            router.push({
              pathname: "/(users)/(RequestService)/CustomerProviderRequestDetails",
              params: {
                offerId: acceptedOffer.id,
                serviceRequestId: active.id,
              },
            });
            return;
          }
        }
      }
      dispatch(setSelectedCategoryId(categoryId));
      router.push({
        pathname: "/(users)/(RequestService)/RequestService",
        params: {
          categoryId,
          categoryName,
        },
      });
    } catch (error: any) {
      if (error?.response?.status === 204) {
        dispatch(setSelectedCategoryId(categoryId));
        router.push({
          pathname: "/(users)/(RequestService)/RequestService",
          params: {
            categoryId,
            categoryName,
          },
        });
      } else {
        console.error("Unexpected error checking pending/active requests:", error);
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  const displayAddress = currentLocation ? `${currentLocation.address.slice(0, 30)}${currentLocation.address.length > 30 ? "..." : ""}` : "Set your location";

  const defaultIcon = require("@/assets/images/gardener.png");

  const renderCarouselItem = ({ item }: { item: FeatureSlide }) => (
    <View style={[styles.featureCard, item.backgroundColor ? { backgroundColor: item.backgroundColor } : null]}>
      {/* Optional background image */}
      {item.backgroundImage && <Image source={item.backgroundImage} style={styles.featureBackgroundImage} resizeMode="cover" />}

      {/* Text content section */}
      <View
        style={[
          styles.featureTextContainer,
          !item.image && { flex: 2 }, // Take more space if there's no image
        ]}
      >
        <Text style={styles.featureTitle}>{item.title}</Text>
        <View style={styles.featureSubtitleContainer}>
          <Text style={styles.featureSubtitle}>{item.subtitle} </Text>
          <Text style={styles.featureHighlightedText}>{item.highlightedText}</Text>
        </View>
        <Text style={styles.featureTagline}>{item.fetaureText}</Text>
      </View>

      {/* Optional feature image section */}
      {item.image && (
        <View style={styles.featureImageContainer}>
          <Image source={item.image} style={styles.featureImage} resizeMode="contain" />
        </View>
      )}
    </View>
  );

  // Render history item in slider
  const renderHistoryItem = ({ item }: { item: any }) => {
    const getStatusStyle = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
          return styles.statusAccepted;
        case "expired":
          return styles.statusExpired;
        default:
          return styles.statusPending;
      }
    };

    const getStatusTextStyle = (status: string) => {
      switch (status.toLowerCase()) {
        case "completed":
          return styles.statusTextAccepted;
        case "expired":
          return styles.statusTextExpired;
        default:
          return styles.statusTextPending;
      }
    };

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() =>
          router.push({
            pathname: "/(users)/historyDetail",
            params: { serviceRequestId: item.id },
          })
        }
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle} numberOfLines={1}>
            {item.serviceCategoryName || "Service Request"}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.historyDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.locationAddress || "Location not specified"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.serviceListNames?.join(", ") || "No services listed"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{formatToNepalTime(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Carousel pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {featureSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeSlideIndex ? "#3F63C7" : "#DDDDDD",
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require("@/assets/images/logo2.png")} style={{ width: 115, height: 75 }} resizeMode="contain" />
        </View>
        <TouchableOpacity onPress={goToProfile}>
          {currentUser?.profilePicture ? (
            <Image
              source={{
                uri: `${IMAGE_API_URL}${currentUser.profilePicture}`,
              }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImage}>
              <Text style={styles.initialsText}>{`${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Location Bar */}
      <TouchableOpacity style={styles.locationBar} onPress={goToLocationSelect}>
        <Ionicons name="location" size={13} color="#525050" />
        <Text style={styles.locationText}>{displayAddress}</Text>
        <Ionicons name="chevron-forward" size={13} color="#525050" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Service Categories */}
        <View style={styles.serviceSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3F63C7" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load services. Please try again.</Text>
            </View>
          ) : (
            <View style={styles.serviceGrid}>
              {categories.map((category) => {
                const imageUri = category.categoryImage ? `${IMAGE_API_URL}${category.categoryImage}` : null;

                return (
                  <TouchableOpacity key={category._id || category.id} style={styles.serviceItem} onPress={() => navigateToService(category._id || category.id, category.name)}>
                    <View style={styles.serviceIconContainer}>
                      {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.serviceIcon} resizeMode="contain" onError={() => console.warn(`Failed to load ${imageUri}`)} />
                      ) : (
                        <Image source={defaultIcon} style={styles.serviceIcon} resizeMode="contain" />
                      )}
                    </View>
                    <Text style={styles.serviceText}>{category.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Features Section - Side-by-Side Text and Image Layout */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          <FlatList
            ref={flatListRef}
            data={featureSlides}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            contentContainerStyle={styles.carouselContainer}
          />
          {renderPaginationDots()}
        </View>

        {/* Orders/History Section */}
        <View style={styles.recentSectionContainer}>
          <Text style={styles.sectionTitle}>Recent Services History</Text>
          {historyRequests.length > 0 ? (
            <FlatList
              data={historyRequests}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historySliderContainer}
              snapToInterval={width - 60} // Account for padding and gap
              decelerationRate="fast"
              snapToAlignment="center"
            />
          ) : (
            <View style={styles.ordersContainer}>
              <Text style={styles.noOrdersText}>No service history available yet...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    height: 70,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    height: 65,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 6,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    color: "#525050",
  },
  serviceSection: {
    padding: 16,
    marginBottom: 5,
    backgroundColor: "#FEFEFE",
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
  serviceText: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF4040",
    textAlign: "center",
  },
  sectionContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 5,
    backgroundColor: "#FFFFFF",
    height: 270,
    shadowColor: "#dedede",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  recentSectionContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
    backgroundColor: "#FFFFFF",
    height: 300,
    shadowColor: "#dedede",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333333",
  },
  carouselContainer: {
    height: 190,
  },
  featureCard: {
    position: "relative",
    width: width - 32,
    height: 190,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  featureBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: "cover",
    zIndex: -1,
  },
  featureTextContainer: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  featureImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 10,
  },
  featureImage: {
    width: "100%",
    height: "90%",
  },
  featureTitle: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },
  featureSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  featureSubtitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "600",
  },
  featureHighlightedText: {
    color: "#3F63C7",
    fontSize: 16,
    fontWeight: "700",
  },
  featureTagline: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "500",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  ordersContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  noOrdersText: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  historySliderContainer: {
    paddingRight: 16,
  },
  historyCard: {
    width: width - 64,
    backgroundColor: "white",
    paddingHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    borderBlockColor: "#CECECE",
    shadowRadius: 3,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  historyDetails: {
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: "#FFF9C4",
  },
  statusAccepted: {
    backgroundColor: "#E8F5E9",
  },
  statusRejected: {
    backgroundColor: "#FFEBEE",
  },
  statusExpired: {
    backgroundColor: "#ECEFF1",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextPending: {
    color: "#F57F17",
  },
  statusTextAccepted: {
    color: "#2E7D32",
  },
  statusTextRejected: {
    color: "#C62828",
  },
  statusTextExpired: {
    color: "#546E7A",
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
    flex: 1,
  },
});
