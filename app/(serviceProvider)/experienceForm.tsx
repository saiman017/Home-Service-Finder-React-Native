import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { serviceProviderSignUp, resetSignupState } from "@/store/slice/serviceProviderSignUp";
import { setSelectedCategoryId } from "@/store/slice/serviceCategory";
import { serviceCategoryStyles as styles } from "./ServiceCategoryStyles";

// Define types for experience form values
interface ExperienceFormValues {
  experience: number;
  personalDescription: string;
}

// Define type for previous form data
interface PreviousFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  gender: string;
  dateOfBirth: string;
}

// Define type for combined service provider data
interface ServiceProviderData extends PreviousFormData {
  experience: number;
  personalDescription: string;
  roleId: string;
  serviceCategoryId: string;
}

// Validation schema for experience form
const ExperienceSchema = Yup.object().shape({
  experience: Yup.number().required("Experience is required").positive("Experience must be a positive number").integer("Experience must be a whole number"),
  personalDescription: Yup.string().required("Personal description is required"),
});

export default function ExperienceForm() {
  // Define constants
  const SERVICE_PROVIDER_ROLE_ID = "903a6d2a-6214-43b0-a7f8-fe5bf3f193a2";
  const [loading, setLoading] = useState(false);

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.serviceProviderSignUp);
  const { serviceCategoryId } = useSelector((state: RootState) => state.serviceCategory);

  const params = useLocalSearchParams();
  const previousFormData: PreviousFormData = params.formData ? JSON.parse(params.formData as string) : {};
  useEffect(() => {
    if (error) {
      Alert.alert("Registration Failed", error);
      dispatch(resetSignupState());
    }
  }, [error, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSignupState());
    };
  }, [dispatch]);

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (values: ExperienceFormValues): Promise<void> => {
    const serviceProviderData: ServiceProviderData = {
      ...previousFormData,
      experience: values.experience,
      personalDescription: values.personalDescription,
      roleId: SERVICE_PROVIDER_ROLE_ID,
      serviceCategoryId: serviceCategoryId || "",
    };

    setLoading(true);
    try {
      await dispatch(serviceProviderSignUp(serviceProviderData)).unwrap();

      dispatch(setSelectedCategoryId(null));

      Alert.alert("Registration Successful", "Please check your email to verify your account.", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(otp)/OtpVerfication");
          },
        },
      ]);
    } catch (error: any) {
      console.error("SignUp error:", error);
      Alert.alert("Registration Failed", typeof error === "string" ? error : error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={"height"} style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <Formik
              initialValues={{
                experience: 0,
                personalDescription: "",
              }}
              validationSchema={ExperienceSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  {/* Experience */}
                  <Text style={[styles.label, { marginTop: 35 }]}>Professional Experience (years)</Text>
                  <TextInput
                    style={[styles.input, touched.experience && errors.experience ? styles.inputError : null]}
                    placeholder="Enter years of experience"
                    value={values.experience === 0 ? "" : values.experience.toString()}
                    onChangeText={handleChange("experience")}
                    onBlur={handleBlur("experience")}
                    keyboardType="numeric"
                  />
                  {touched.experience && errors.experience ? <Text style={styles.errorText}>{errors.experience}</Text> : null}

                  {/* Personal Description */}
                  <Text style={[styles.label, { marginTop: 16 }]}>About You</Text>
                  <TextInput
                    style={[styles.textArea, touched.personalDescription && errors.personalDescription ? styles.inputError : null]}
                    placeholder=" "
                    value={values.personalDescription}
                    onChangeText={handleChange("personalDescription")}
                    onBlur={handleBlur("personalDescription")}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                  {touched.personalDescription && errors.personalDescription ? <Text style={styles.errorText}>{errors.personalDescription}</Text> : null}

                  <TouchableOpacity style={styles.registerButton} onPress={() => handleSubmit()} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Register</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
