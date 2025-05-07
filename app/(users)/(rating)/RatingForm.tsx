import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, Image } from "react-native";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { addRating } from "@/store/slice/rating";
import { fetchServiceProviderById } from "@/store/slice/serviceProvider";
import type { AppDispatch, RootState } from "@/store/store";
import Constants from "expo-constants";

interface RatingFormProps {
  serviceProviderId: string;
  serviceRequestId?: string;
  onComplete?: () => void;
}

const DEFAULT_PROFILE_IMAGE = require("@/assets/images/electrician.png");
const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

export default function RatingForm({ serviceProviderId, serviceRequestId, onComplete }: RatingFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { loading } = useSelector((state: RootState) => state.rating);
  const { userId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (serviceProviderId) {
      dispatch(fetchServiceProviderById(serviceProviderId));
    }
  }, [serviceProviderId, dispatch]);

  // Ensure provider is fetched from Redux store
  const provider = useSelector((state: RootState) => state.serviceProvider.selectedProvider);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starContainer}>
          <Ionicons name={i <= rating ? "star" : "star-outline"} size={42} color="#FFCA28" />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  // Get profile picture URL if available
  const getProfilePicture = () => {
    if (provider?.profilePicture) {
      return { uri: `${IMAGE_API_URL}${provider.profilePicture}` };
    }
    return DEFAULT_PROFILE_IMAGE;
  };

  // Display the name from the provider data if available
  const displayName = provider?.firstName && provider?.lastName ? `${provider.firstName} ${provider.lastName}` : "Service Provider";

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User is not authenticated");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        addRating({
          userId: userId as string, // Assert userId as string since we've validated it
          serviceProviderId,
          value: rating,
          comments: comment.trim() || undefined,
          serviceRequestId: serviceRequestId || undefined,
        })
      ).unwrap();

      Alert.alert("Thank You", "Your rating has been submitted successfully", [
        {
          text: "OK",
          onPress: () => {
            if (onComplete) {
              onComplete();
            } else {
              router.replace("/(tabs)/home");
            }
          },
        },
      ]);
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Rate Service Provider" showBackButton />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3F63C7" />
            <Text style={styles.loadingText}>Loading provider details...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.ratingTitle}>How was your experience?</Text>
            <View style={styles.providerCard}>
              <Image source={getProfilePicture()} style={styles.profileImage} />
              <Text style={styles.providerName}>{displayName}</Text>
            </View>

            <View style={styles.starsContainer}>{renderStars()}</View>

            <Text style={styles.ratingDescription}>{rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : rating === 5 ? "Excellent" : ""}</Text>

            <Text style={styles.label}>Comment (Optional)</Text>
            <TextInput style={styles.textArea} placeholder="Tell us about your experience..." multiline numberOfLines={5} textAlignVertical="top" value={comment} onChangeText={setComment} />

            <TouchableOpacity style={[styles.submitButton, (rating === 0 || submitting) && { opacity: 0.7 }]} onPress={handleSubmit} disabled={rating === 0 || submitting}>
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Submit</Text>}
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.skipButton} onPress={() => router.replace("/(tabs)/home")} disabled={submitting}>
              <Text style={styles.skipButtonText}>Skip Rating</Text>
            </TouchableOpacity> */}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, padding: 20 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666666" },
  providerCard: {
    alignItems: "center",
    // marginBottom: 10,
    // backgroundColor: "#FFFFFF",
    // padding: 10,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  providerName: { fontSize: 18, fontWeight: "600", color: "#333333", marginBottom: 4 },
  contactInfo: { fontSize: 14, color: "#666666" },
  ratingTitle: { fontSize: 20, fontWeight: "600", textAlign: "center", marginVertical: 16, color: "#333333" },
  starsContainer: { flexDirection: "row", justifyContent: "center", marginVertical: 16 },
  starContainer: { padding: 5 },
  ratingDescription: { textAlign: "center", fontSize: 18, color: "#3F63C7", fontWeight: "500", marginBottom: 24 },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#666666" },
  textArea: { height: 120, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 24 },
  submitButton: { backgroundColor: "#3F63C7", paddingVertical: 16, borderRadius: 10, alignItems: "center", marginBottom: 12 },
  submitButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  skipButton: { paddingVertical: 16, borderRadius: 10, alignItems: "center" },
  skipButtonText: { color: "#666666", fontWeight: "500", fontSize: 16 },
});
