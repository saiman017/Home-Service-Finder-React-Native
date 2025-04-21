import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";

// First, let's add a "Start Work" button component to the OfferDetails screen
// This component should be added to your OfferDetails.tsx file

export const StartWorkButton = ({
  offerId,
  serviceRequestId,
}: {
  offerId: string;
  serviceRequestId: string;
}) => {
  return (
    <TouchableOpacity
      style={styles.startWorkButton}
      onPress={() => {
        router.push({
          pathname: "/(serviceProvider)/ServiceProviderWorkflow ",
          params: { offerId, serviceRequestId },
        });
      }}
    >
      <Ionicons name="navigate-outline" size={20} color="#FFFFFF" />
      <Text style={styles.buttonText}>Start Work</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Styles for the StartWorkButton component
  startWorkButton: {
    backgroundColor: "#3F63C7",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
