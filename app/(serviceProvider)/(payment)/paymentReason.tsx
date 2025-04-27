import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import Header from "@/components/Header";
import {
  updatePaymentStatus,
  updatePaymentReason,
} from "@/store/slice/serviceOffer";
import { useLocalSearchParams } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

export default function PaymentReasonForm() {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Update payment status to false
      await dispatch(
        updatePaymentStatus({ offerId: offerId!, paymentStatus: false })
      ).unwrap();

      // 2. Submit the payment reason
      await dispatch(
        updatePaymentReason({ offerId: offerId!, paymentReason: reason })
      ).unwrap();

      // 3. Navigate back to home
      Alert.alert("Submission Successful", "Your issue has been reported.", [
        {
          text: "OK",
          onPress: () => router.replace("/(serviceProvider)/(tab)/home"),
        },
      ]);
    } catch (error) {
      setError("Failed to submit reason. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Report Payment Issue" showBackButton={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.inner}>
            <View style={styles.form}>
              {/* Reason Input */}
              <Text style={styles.label}>Reason for not receiving payment</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Describe your issue here..."
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  if (error) setError("");
                }}
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#808080",
    fontWeight: "500",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: "#808080",
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff4d4f",
  },
  errorText: {
    color: "#ff4d4f",
    marginTop: 4,
    fontSize: 12,
  },
  submitButton: {
    height: 55,
    backgroundColor: "#3F63C7",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
