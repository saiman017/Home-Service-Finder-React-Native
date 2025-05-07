// app/Policies.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "@/components/Header";

export default function Policies() {
  return (
    <View style={styles.container}>
      <Header title="Policies" showBackButton />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Terms of Service</Text>
        <Text style={styles.paragraph}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.</Text>

        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.paragraph}>Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.</Text>

        {/* Add more sections as needed */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEFEFE" },
  content: { padding: 20 },
  heading: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  paragraph: { fontSize: 14, color: "#555", lineHeight: 20 },
});
