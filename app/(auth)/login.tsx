import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { login, setOtpRequired } from "@/store/slice/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clearEmail } from "@/store/slice/signup";
import { clearEmail as serviceProviderClearEmail } from "@/store/slice/serviceProviderSignUp";
import { clearEmail as LoginEmail } from "@/store/slice/auth";
import { getServiceRequestById } from "@/store/slice/serviceRequest";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const {
    accessToken,
    isAuthenticated,
    role,
    isEmailVerified,
    userId,
    otpRequired,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(setOtpRequired(false));
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (isAuthenticated && accessToken && role?.toLowerCase() == "customer") {
      dispatch(clearEmail());
      dispatch(serviceProviderClearEmail());
      dispatch(LoginEmail());

      console.log("sass", role);

      console.log("User authenticated, redirecting to home...");
      router.replace("/(tabs)/home");
      return;
    } else if (
      isAuthenticated &&
      accessToken &&
      role?.toLowerCase() == "serviceprovider"
    ) {
      dispatch(clearEmail());
      dispatch(serviceProviderClearEmail());
      dispatch(LoginEmail());

      console.log("sass", role);

      console.log("User authenticated, redirecting to home...");
      router.replace("/(serviceProvider)/(tab)/home");
      return;
    }

    if (otpRequired && email) {
      console.log("Email not verified, redirecting to OTP verification...");
      router.push("/(otp)/OtpVerfication");
    }
  }, [isAuthenticated, accessToken, otpRequired, loading]);

  // In your login component (Login.tsx)
  // useEffect(() => {
  //   if (loading) return;

  //   const handlePostLoginFlow = async () => {
  //     if (
  //       isAuthenticated &&
  //       accessToken &&
  //       role?.toLowerCase() === "customer"
  //     ) {
  //       try {
  //         // Check for pending requests
  //         const result = await dispatch(checkPendingRequests(userId!)).unwrap();

  //         if (result && result.length > 0) {
  //           // Get the most recent pending request
  //           const mostRecentRequest = result[0];

  //           // Dispatch to set the current request
  //           await dispatch(
  //             getServiceRequestById(mostRecentRequest.id)
  //           ).unwrap();

  //           // Navigate to after request service page
  //           router.replace("/AfterRequestService");
  //         } else {
  //           // No pending requests, proceed normally
  //           dispatch(clearEmail());
  //           dispatch(serviceProviderClearEmail());
  //           dispatch(LoginEmail());
  //           router.replace("/(tabs)/home");
  //         }
  //       } catch (error) {
  //         console.error("Error checking pending requests:", error);
  //         // Fallback to home if there's an error
  //         router.replace("/(tabs)/home");
  //       }
  //     } else if (
  //       isAuthenticated &&
  //       accessToken &&
  //       role?.toLowerCase() === "serviceprovider"
  //     ) {
  //       // Handle service provider flow
  //       dispatch(clearEmail());
  //       dispatch(serviceProviderClearEmail());
  //       dispatch(LoginEmail());
  //       router.replace("/(serviceProvider)/(tab)/home");
  //     }
  //   };

  //   if (isAuthenticated && accessToken && role) {
  //     handlePostLoginFlow();
  //   }
  // }, [
  //   isAuthenticated,
  //   accessToken,
  //   role,
  //   otpRequired,
  //   loading,
  //   dispatch,
  //   userId,
  // ]);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!re.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    dispatch(setOtpRequired(false));
    setLoading(true);
    try {
      await dispatch(
        login({
          email: email.trim(),
          password: password.trim(),
        })
      ).unwrap();
    } catch (error: any) {
      console.error("Login error:", error);
      if (
        typeof error === "string" &&
        error.includes("Failed to decode login response")
      ) {
        Alert.alert("Login Unsuccessful", "Invalid email or password");
      } else {
        Alert.alert("Login Unsuccessfully", error.toString());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/Home_Service_Finder_Logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Sign in to your Account</Text>
          <Text style={styles.subtitle}>
            Enter your email and password to log in
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            onBlur={() => validateEmail(email)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View
            style={[
              styles.passwordContainer,
              passwordError ? styles.inputError : null,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#808080"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
            // onPress={() => router.replace("/auth/forgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text
              style={styles.signupText}
              onPress={() => router.push("/(auth)/SignUp")}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Want to be register as service provider?{" "}
          </Text>
          <TouchableOpacity>
            <Text
              style={styles.signupText}
              onPress={() => router.push("/(serviceProvider)/serviceCategory")}
            >
              Click here
            </Text>
          </TouchableOpacity>
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
    // justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 60,
  },
  logo: {
    width: 500,
    height: 120,
    marginBottom: 24,
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
    fontWeight: 500,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: "#808080",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  inputError: {
    borderColor: "#ff4d4f",
  },
  errorText: {
    color: "#ff4d4f",
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6dede",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#1e1e1e",
    fontWeight: 500,
  },
  loginButton: {
    height: 55,
    backgroundColor: "#3F63C7",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#808080",
  },
  signupText: {
    color: "#3F63C7",
    fontWeight: "500",
  },
});
