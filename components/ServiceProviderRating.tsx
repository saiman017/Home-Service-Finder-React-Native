import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchRatingStats } from "@/store/slice/rating";

interface ServiceProviderRatingProps {
  serviceProviderId: string;
  size?: "small" | "medium" | "large";
  color?: string;
  showCount?: boolean;
}

export const ServiceProviderRating: React.FC<ServiceProviderRatingProps> = ({ serviceProviderId, size = "medium", color = "#FFB800", showCount = true }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, statsLoading, statsError } = useSelector((state: RootState) => state.rating);

  // Size configurations
  const sizeConfig = {
    small: {
      starSize: 14,
      fontSize: 12,
      countFontSize: 10,
    },
    medium: {
      starSize: 16,
      fontSize: 14,
      countFontSize: 12,
    },
    large: {
      starSize: 20,
      fontSize: 16,
      countFontSize: 14,
    },
  };

  const { starSize, fontSize, countFontSize } = sizeConfig[size];

  useEffect(() => {
    if (serviceProviderId) {
      dispatch(fetchRatingStats(serviceProviderId));
    }
  }, [serviceProviderId, dispatch]);

  // If we're loading stats
  if (statsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={color} />
      </View>
    );
  }

  // If there's an error or no stats available
  if (statsError || !stats) {
    return (
      <View style={styles.container}>
        <Ionicons name="star" size={starSize} color={color} />
        <Text style={[styles.ratingText, { fontSize, color: "#666" }]}>0.00</Text>
        {showCount && <Text style={[styles.countText, { fontSize: countFontSize }]}>(0)</Text>}
      </View>
    );
  }

  // Check if this is the correct provider's stats
  if (stats.serviceProviderId !== serviceProviderId) {
    return (
      <View style={styles.container}>
        <Ionicons name="star" size={starSize} color={color} />
        <Text style={[styles.ratingText, { fontSize, color: "#666" }]}>0.00</Text>
        {showCount && <Text style={[styles.countText, { fontSize: countFontSize }]}>(0)</Text>}
      </View>
    );
  }

  // Format the average rating to 2 decimal places
  const averageRating = stats.average.toFixed(2);
  const ratingCount = stats.count;

  return (
    <View style={styles.container}>
      <Ionicons name="star" size={starSize} color={color} />
      <Text style={[styles.ratingText, { fontSize }]}>{averageRating}</Text>
      {showCount && <Text style={[styles.countText, { fontSize: countFontSize }]}>({ratingCount})</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "500",
    color: "#333",
  },
  countText: {
    marginLeft: 2,
    color: "#666",
    fontWeight: "400",
  },
});

export default ServiceProviderRating;
