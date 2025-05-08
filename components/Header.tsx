import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Header({ title, showBackButton = false, onBackPress, leftComponent, rightComponent }: any) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      {/* Left section (back button or custom component) */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        )}
        {leftComponent && leftComponent}
      </View>

      {/* Title */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Right section */}
      <View style={styles.rightSection}>{rightComponent ? rightComponent : <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    height: 65,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  leftSection: {
    width: 50,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rightSection: {
    width: 50,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
});
