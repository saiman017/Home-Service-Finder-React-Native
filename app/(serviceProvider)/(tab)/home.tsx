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

  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { userId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
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
        <Text>Service Provider</Text>
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
});
