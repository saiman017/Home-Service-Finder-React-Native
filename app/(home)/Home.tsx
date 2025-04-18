import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slice/auth";
import { fetchServiceCategories } from "@/store/slice/serviceCategory";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const dispatch = useDispatch();
  const { categories, isLoading, error } = useSelector(
    (state: RootState) => state.serviceCategory
  );

  useEffect(() => {
    dispatch(fetchServiceCategories() as any);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/(auth)/Landing");
  };

  const goToProfile = () => {
    router.push("/(home)/Profile");
  };

  const navigateToService = (service: ServiceCategory) => {
    console.log(`Navigating to ${service.name} service`);
    // router.push(`/(services)/${service.name.toLowerCase()}`);
  };

  interface ServiceCategory {
    _id: string;
    name: string;
    icon: string;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header with Logo and Profile */}
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
        <TouchableOpacity style={styles.locationBar}>
          <Ionicons name="location" size={13} color="#525050" />
          <Text style={styles.locationText}>
            Thapathali boys Hostel, School Gali
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#525050" />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Service Categories */}
          <View style={styles.serviceSection}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#333" />
            ) : error ? (
              <Text style={{ color: "red" }}>{error}</Text>
            ) : (
              <View style={styles.serviceGrid}>
                {categories.map((service: ServiceCategory) => (
                  <TouchableOpacity
                    key={service._id}
                    style={styles.serviceItem}
                    onPress={() => navigateToService(service)}
                  >
                    <View style={styles.serviceIconContainer}>
                      <Image
                        source={{ uri: service.icon }}
                        style={styles.serviceIcon}
                      />
                    </View>
                    <Text style={styles.serviceText}>{service.name}</Text>
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
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
    backgroundColor: "#FFFFFF",
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
});
