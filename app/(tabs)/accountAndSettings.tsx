import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import Header from "@/components/Header";
import { Ionicons, Entypo, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slice/auth";
import { router } from "expo-router";
import { fetchUserById, selectUserById } from "@/store/slice/user";
import type { AppDispatch, RootState } from "@/store/store";
import { clearCurrentLocation } from "@/store/slice/location";

export default function AccountAndSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useSelector((state: RootState) => state.auth);
  const currentUser = useSelector(selectUserById);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
  }, [dispatch, userId]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCurrentLocation());
    router.replace("/(auth)/Landing");
  };

  const handleProfile = () => {
    router.push("/(users)/userProfile");
  };

  const handleHelp = () => {
    router.push("/(support)/Help");
  };

  const handleEmergency = () => {
    router.push("/(support)/EmergencySupport");
  };

  const handlePolicy = () => {
    router.push("/(support)/Policies");
  };

  return (
    <View style={styles.container}>
      <Header title="Account & Settings" showBackButton={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Profile Section */}
          <View style={styles.profile}>
            <View style={styles.profileHeader}>
              {currentUser?.profilePicture ? (
                <Image
                  source={{
                    uri: `http://10.0.2.2:5039${currentUser.profilePicture}`,
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{currentUser ? `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}` : ""}</Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Loading..."}</Text>
                <Text style={styles.profileContact}>{currentUser?.phoneNumber || ""}</Text>
              </View>
            </View>
          </View>

          {/* Notification */}
          {/* <View style={styles.singleBar}>
            <TouchableOpacity style={styles.bar}>
              <Ionicons name="notifications" size={24} color="#525050" />
              <Text style={styles.barText}>Notification</Text>
              <Ionicons name="chevron-forward" size={20} color="#525050" />
            </TouchableOpacity>
          </View> */}

          {/* Account Section */}
          <View style={styles.account}>
            <Text style={styles.subtitile}>Account</Text>
            <TouchableOpacity style={styles.bar} onPress={() => handleProfile()}>
              <Ionicons name="person-circle" size={24} color="#525050" />
              <Text style={styles.barText}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Help & Legal */}
          <View style={styles.account}>
            <Text style={styles.subtitile}>Help & Legal</Text>
            <TouchableOpacity style={styles.bar} onPress={() => handleEmergency()}>
              <MaterialIcons name="contact-support" size={24} color="#525050" />
              <Text style={styles.barText}>Emergency Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bar} onPress={() => handleHelp()}>
              <FontAwesome name="support" size={24} color="#525050" />
              <Text style={styles.barText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bar} onPress={() => handlePolicy()}>
              <MaterialIcons name="policy" size={24} color="#525050" />
              <Text style={styles.barText}>Policies</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <View style={styles.singleBar}>
            <TouchableOpacity style={styles.bar} onPress={handleLogout}>
              <Entypo name="log-out" size={24} color="#525050" />
              <Text style={styles.barText}>Log Out</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
  },

  profile: {
    backgroundColor: "#ffffff",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 2,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#3F63C7",
  },
  initialsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#C4C4C4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#3F63C7",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 15,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    textTransform: "capitalize",
    marginBottom: 5,
  },
  profileContact: {
    fontSize: 14,
    color: "#777777",
  },
  scrollContent: {
    paddingBottom: 200,
  },
  account: {
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 2,
    backgroundColor: "#ffffff",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  singleBar: {
    backgroundColor: "#ffffff",
    width: "100%",
    paddingHorizontal: 20,
    height: 65,
    marginBottom: 2,
  },
  subtitile: {
    color: "#999999",
    fontSize: 15,
    marginBottom: 5,
    fontWeight: "500",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
  },
  barText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333333",
  },
});
