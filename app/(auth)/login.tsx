import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { login, setOtpRequired } from "@/store/slice/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clearEmail } from "@/store/slice/signup";
import { clearEmail as serviceProviderClearEmail } from "@/store/slice/serviceProviderSignUp";
import { clearEmail as LoginEmail } from "@/store/slice/auth";
import { Formik } from "formik";
import * as Yup from "yup";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, isAuthenticated, role, isEmailVerified, userId, otpRequired } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(setOtpRequired(false));
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (isAuthenticated && accessToken) {
      dispatch(clearEmail());
      dispatch(serviceProviderClearEmail());
      dispatch(LoginEmail());

      if (role?.toLowerCase() === "customer") {
        console.log("User authenticated, redirecting to customer home...");
        router.replace("/(tabs)/home");
      } else if (role?.toLowerCase() === "serviceprovider") {
        console.log("User authenticated, redirecting to service provider home...");
        router.replace("/(serviceProvider)/(tab)/home");
      }
      return;
    }

    if (otpRequired) {
      console.log("Email not verified, redirecting to OTP verification...");
      router.push("/(otp)/OtpVerfication");
    }
  }, [isAuthenticated, accessToken, otpRequired, loading]);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  });

  const handleLogin = async (values: { email: string; password: string }) => {
    dispatch(setOtpRequired(false));
    setLoading(true);
    try {
      await dispatch(
        login({
          email: values.email.trim(),
          password: values.password.trim(),
        })
      ).unwrap();
    } catch (error: any) {
      console.error("Login error:", error);
      if (typeof error === "string" && error.includes("Failed to decode login response")) {
        Alert.alert("Login Unsuccessful", "Invalid email or password");
      } else {
        Alert.alert("Login Unsuccessful", error.toString());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Image source={require("@/assets/images/Home_Service_Finder_Logo.png")} style={styles.logo} />
          <Text style={styles.title}>Sign in to your Account</Text>
          <Text style={styles.subtitle}>Enter your email and password to log in</Text>
        </View>

        <Formik initialValues={{ email: "", password: "" }} validationSchema={LoginSchema} onSubmit={handleLogin}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
              <View style={[styles.passwordContainer, touched.password && errors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#808080" />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity
                // onPress={() => router.replace("/auth/forgotPassword")}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={() => handleSubmit()} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.loginButtonText}>Log In</Text>}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signupText} onPress={() => router.push("/(auth)/SignUp")}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Want to register as service provider? </Text>
          <TouchableOpacity>
            <Text style={styles.signupText} onPress={() => router.push("/(serviceProvider)/serviceCategory")}>
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
    fontWeight: "500",
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
    fontWeight: "500",
  },
  loginButton: {
    height: 55,
    backgroundColor: "#3F63C7",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
