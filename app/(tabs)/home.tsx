import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slice/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchServiceCategories,
  setSelectedCategoryId,
} from "@/store/slice/serviceCategory";
import { AppDispatch, RootState } from "@/store/store"; // Import the correct dispatch type
import { fetchLocation } from "@/store/slice/location";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading, error } = useSelector(
    (state: RootState) => state.serviceCategory
  );
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { userId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchServiceCategories());
    if (userId) {
      dispatch(fetchLocation(userId));
    }
  }, [dispatch]);

  const goToProfile = () => {
    router.push("/(users)/userProfile");
  };
  const goToLocationSelect = () => {
    router.push("/(users)/(location)/setAddress");
  };
  // const goToRequestService = () => {
  //   router.push("/(users)/(RequestService)/RequestService");
  // };

  const navigateToService = (categoryId: string, categoryName: string) => {
    dispatch(setSelectedCategoryId(categoryId));
    router.push({
      pathname: "/(users)/(RequestService)/RequestService",
      params: {
        categoryId,
        categoryName,
      },
    });
  };

  const displayAddress = currentLocation
    ? `${currentLocation.address.slice(0, 30)}${
        currentLocation.address.length > 30 ? "..." : ""
      }`
    : "Set your location";

  const defaultIcon = require("@/assets/images/gardener.png");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo2.png")}
            style={{ width: 115, height: 75 }}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={goToProfile}>
          <Image
            source={require("@/assets/images/gardener.png")}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Location Bar */}
      <TouchableOpacity style={styles.locationBar} onPress={goToLocationSelect}>
        <Ionicons name="location" size={13} color="#525050" />
        <Text style={styles.locationText}>{displayAddress}</Text>
        <Ionicons name="chevron-forward" size={13} color="#525050" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Service Categories */}
        <View style={styles.serviceSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F8C52B" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Failed to load services. Please try again.
              </Text>
            </View>
          ) : (
            <View style={styles.serviceGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id || category.id}
                  style={styles.serviceItem}
                  onPress={() =>
                    navigateToService(
                      category._id || category.id,
                      category.name
                    )
                  }
                >
                  <View style={styles.serviceIconContainer}>
                    {category.iconUrl ? (
                      <Image
                        source={{ uri: category.iconUrl }}
                        style={styles.serviceIcon}
                        defaultSource={defaultIcon}
                      />
                    ) : (
                      <Image source={defaultIcon} style={styles.serviceIcon} />
                    )}
                  </View>
                  <Text style={styles.serviceText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureContent}>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Guide to Create</Text>
                <Text style={styles.featureTitle}>
                  On-Demand{" "}
                  <Text style={styles.highlightText}>Home Services App</Text>
                </Text>
                <Text style={styles.featureTitle}>
                  Features & Cost Estimation
                </Text>
              </View>
              <Image
                source={require("@/assets/images/gardener.png")}
                style={styles.featureImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Orders Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <View style={styles.ordersContainer}>
            <Text style={styles.noOrdersText}>No order till now....</Text>
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333333",
  },
  featureCard: {
    marginBottom: 16,
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  featureTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  highlightText: {
    color: "#F8C52B",
  },
  featureImage: {
    width: 120,
    height: 120,
  },
  ordersContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 280,
  },
  noOrdersText: {
    color: "#AAAAAA",
    fontSize: 14,
  },
});
