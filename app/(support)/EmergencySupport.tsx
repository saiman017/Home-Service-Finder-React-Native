// app/EmergencySupport.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import Header from "@/components/Header";

export default function EmergencySupport() {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Emergency Support" showBackButton />
      <View style={styles.content}>
        <Text style={styles.heading}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.card} onPress={() => handleCall("911")}>
          <Text style={styles.cardTitle}>General Emergency</Text>
          <Text style={styles.cardNumber}>911</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F6" },
  content: { padding: 20 },
  heading: { fontSize: 22, fontWeight: "600", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "500" },
  cardNumber: { fontSize: 18, fontWeight: "700", color: "#3F63C7" },
});
