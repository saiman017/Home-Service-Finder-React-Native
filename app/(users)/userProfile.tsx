import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import Header from "@/components/Header";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { fetchUserById, selectUserById } from "@/store/slice/user";
import type { AppDispatch, RootState } from "@/store/store";

export default function UserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useSelector((state: RootState) => state.auth);
  const currentUser = useSelector(selectUserById);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (userId) {
        try {
          await dispatch(fetchUserById(userId));
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          Alert.alert(
            "Error",
            "Failed to load profile data. Please try again."
          );
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [dispatch, userId]);

  const handleEditProfile = () => {
    router.push("/(users)/editProfile");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Profile" showBackButton={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header with Image */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {currentUser?.profilePicture ? (
              <Image
                source={{
                  uri: `http://10.0.2.2:5039${currentUser.profilePicture}`,
                }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text
                  style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}
                >
                  {currentUser
                    ? `${currentUser.firstName?.[0] || ""}${
                        currentUser.lastName?.[0] || ""
                      }`
                    : ""}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={18} color="#FFFFFF" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>
                  {currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.email || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.phoneNumber || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.gender || "Not provided"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.dateOfBirth
                    ? formatDate(currentUser.dateOfBirth)
                    : "Not provided"}
                </Text>
              </View>
            </View>
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileTextContainer: {
    flex: 1,
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
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#808080",
  },
  editProfileButton: {
    backgroundColor: "#3F63C7",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  editProfileButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },

  section: {
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  infoCard: {
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
});
