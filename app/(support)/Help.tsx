// app/Help.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from "react-native";
import Header from "@/components/Header";

const faqs = [
  {
    q: "How do I book a service?",
    a: "Go to the home screen, pick a category, then fill out your request details.",
  },
  {
    q: "Can I cancel my request?",
    a: "Yes, in your Orders tab you can tap 'Cancel' before the provider starts work.",
  },
];

export default function Help() {
  return (
    <View style={styles.container}>
      <Header title="Help & FAQs" showBackButton />
      <ScrollView contentContainerStyle={styles.content}>
        {faqs.map((faq, i) => (
          <View key={i} style={styles.faqItem}>
            <Text style={styles.question}>{faq.q}</Text>
            <Text style={styles.answer}>{faq.a}</Text>
          </View>
        ))}

        <Text style={[styles.question, { marginTop: 20 }]}>Still need help?</Text>
        <TouchableOpacity onPress={() => Linking.openURL("mailto:yourhomeservicefinder@gmail.com")}>
          <Text style={styles.link}>yourhomeservicefinder@gmail.com</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEFEFE" },
  content: { padding: 20 },
  faqItem: { marginBottom: 16 },
  question: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  answer: { fontSize: 14, color: "#555" },
  link: { fontSize: 16, color: "#3F63C7", textDecorationLine: "underline" },
});
