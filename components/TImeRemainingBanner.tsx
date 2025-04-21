import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useCountdown,
  formatRemainingTime,
  getTimeElapsedPercentage,
} from "@/utils/timeCounter";

interface TimeRemainingBannerProps {
  createdAt: string;
  expiresAt: string;
}
interface TimeRemainingMinSecProps {
  expiresAt: string;
}

export function TimeRemainingMinSec({ expiresAt }: { expiresAt: string }) {
  const { minutes, seconds, isExpired } = useCountdown(expiresAt);

  if (isExpired) return <Text>Expired</Text>;

  return (
    <Text>
      {minutes}m {seconds}s
    </Text>
  );
}
export function TimeRemainingBanner({
  createdAt,
  expiresAt,
}: TimeRemainingBannerProps) {
  // Use the custom hook to get time remaining with automatic updates
  const timeInfo = useCountdown(expiresAt);

  // Calculate completion percentage for the progress bar
  const completionPercentage = getTimeElapsedPercentage(createdAt, expiresAt);

  // Determine color based on time remaining
  const getColorScheme = () => {
    if (timeInfo.isExpired) {
      return {
        background: "#FFEBEE",
        text: "#D32F2F",
        icon: "#D32F2F",
      };
    }

    // Less than 5 minutes remaining
    if (timeInfo.totalSeconds < 300) {
      return {
        background: "#FFEBEE",
        text: "#D32F2F",
        icon: "#D32F2F",
      };
    }

    // Less than 15 minutes remaining
    if (timeInfo.totalSeconds < 900) {
      return {
        background: "#FFF8E1",
        text: "#FF6B00",
        icon: "#FF6B00",
      };
    }

    // More than 15 minutes
    return {
      background: "#E8F5E9",
      text: "#2E7D32",
      icon: "#2E7D32",
    };
  };

  const colors = getColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWrapper}>
        <Ionicons name="time" size={18} color={colors.icon} />
        <Text style={[styles.timeText, { color: colors.text }]}>
          {formatRemainingTime(timeInfo)}
        </Text>
      </View>

      {/* Progress bar showing elapsed time */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${completionPercentage}%`, backgroundColor: colors.text },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeText: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },
  progressBarContainer: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  progressBar: {
    height: "100%",
  },
});
