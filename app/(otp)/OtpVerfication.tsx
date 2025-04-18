import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { router } from "expo-router";
import { verifyOTP, resendOTP } from "@/store/slice/otp";
import { setOtpRequired } from "@/store/slice/auth";
import { Ionicons } from "@expo/vector-icons";

export default function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const dispatch = useDispatch<AppDispatch>();

  // Get email from Redux state
  const { email: loginEmail, otpRequired } = useSelector(
    (state: RootState) => state.auth
  );
  const { email: signUpEmail } = useSelector(
    (state: RootState) => state.signup
  );
  const { email: serviceProviderEmail } = useSelector(
    (state: RootState) => state.serviceProviderSignUp
  );

  const { isVerifying, error, success } = useSelector(
    (state: RootState) => state.otp
  );

  const email = serviceProviderEmail || loginEmail || signUpEmail;
  console.log(email);

  // Verify we have an email and OTP is required
  useEffect(() => {
    if (!email) {
      console.log("Error: No email in state");
      Alert.alert("Error", "Email is missing. Please try logging in again.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
      return;
    }

    if (!otpRequired) {
      console.log("OTP not required, might be a direct navigation");
      // Consider setting otpRequired to true here if this is directly navigated to
    }

    console.log("OTP verification for email:", email);
  }, [email, otpRequired]);

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Email is required for verification");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit OTP code");
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(
        verifyOTP({
          Email: email,
          OTPCode: otpCode,
        })
      ).unwrap();

      if (result.success) {
        // Reset OTP required flag
        dispatch(setOtpRequired(false));

        Alert.alert(
          "Verification Successful",
          "Your email has been verified successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(auth)/login");
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("OTP Verification error:", error);
      Alert.alert(
        "Verification Failed",
        typeof error === "string" ? error : "Failed to verify OTP code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Email is required to resend OTP");
      return;
    }
    setResendDisabled(true);
    setCountdown(60);

    try {
      const result = await dispatch(resendOTP({ Email: email })).unwrap();
      if (result.success) {
        Alert.alert(
          "OTP Sent",
          `A new verification code has been sent to ${email}`
        );
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      Alert.alert(
        "Failed to Resend",
        typeof error === "string" ? error : "Failed to resend verification code"
      );
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  // display email
  const emailDisplay = email;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity> */}

        <View style={styles.header}>
          <Image
            source={require("@/assets/images/Enter OTP-pana.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the verification code we just sent to your email address{" "}
            {emailDisplay}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              ref={(ref) => (inputRefs.current[index] = ref)}
              autoCapitalize="none"
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          {resendDisabled ? (
            <Text style={styles.countdownText}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendButton}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  inner: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginTop: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 5,
  },
  logo: {
    width: 350,
    height: 250,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#808080",
    fontWeight: "500",
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  verifyButton: {
    height: 55,
    backgroundColor: "#3F63C7",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    color: "#808080",
  },
  resendButton: {
    color: "#3F63C7",
    fontWeight: "500",
  },
  countdownText: {
    color: "#808080",
    fontWeight: "500",
  },
});
