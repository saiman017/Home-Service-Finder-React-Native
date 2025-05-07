import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import RatingForm from "./RatingForm";

export default function RatingScreen() {
  // Get params from the navigation
  const { serviceProviderId, serviceRequestId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <RatingForm serviceProviderId={serviceProviderId as string} serviceRequestId={serviceRequestId as string} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
});
