import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setEmail, resetSignupState } from "@/store/slice/serviceProviderSignUp";
import { serviceCategoryStyles as styles } from "./ServiceCategoryStyles";
import MaskInput, { Masks } from "react-native-mask-input";

interface PersonalInfoFormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Gender option type
interface GenderOption {
  label: string;
  value: string;
}

// Validation schema for first page
const PersonalInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .matches(/^[A-Z][a-zA-Z]*$/, "First name must start with a capital letter"),
  lastName: Yup.string()
    .required("Last name is required")
    .matches(/^[A-Z][a-zA-Z]*$/, "Last name must start with a capital letter"),
  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .test("is-old-enough", "You must be at least 18 years old to register", function (value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }),
  gender: Yup.string().required("Gender is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function SignUp(): React.ReactElement {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);
  const TEN_DIGIT_MASK = Array(10).fill(/\d/);

  // Redux hooks
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.serviceProviderSignUp);
  const { serviceCategoryId } = useAppSelector((state) => state.serviceCategory);

  const genderOptions: GenderOption[] = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  // Display error from Redux state
  useEffect(() => {
    if (error) {
      Alert.alert("Registration Failed", error);
      dispatch(resetSignupState()); // Reset error state after displaying
    }
  }, [error, dispatch]);

  const handleContinue = (values: PersonalInfoFormValues): void => {
    // Store form data in Redux state and navigate to the second page
    dispatch(setEmail(values.email)); // Save email for verification later

    // Navigate to the second page with form values
    router.push({
      pathname: "/(serviceProvider)/experienceForm",
      params: {
        formData: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phone,
          password: values.password,
          confirmPassword: values.confirmPassword,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
        }),
      },
    } as any);
  };

  const formatDate = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    // Always return ISO format for API
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";

    // If already in MM/DD/YYYY format, return as is
    if (dateStr.includes("/")) return dateStr;

    // Convert from ISO format to display format
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  // Reset signup state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetSignupState());
    };
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.title}>Sign Up</Text>
              <Text style={styles.subtitle}>Create an account to continue!</Text>
            </View>

            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                dateOfBirth: "",
                gender: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={PersonalInfoSchema}
              onSubmit={handleContinue}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                <View style={styles.form}>
                  {/* First Name and Last Name in one row */}
                  <View style={styles.rowContainer}>
                    {/* First Name */}
                    <View style={styles.columnContainer}>
                      <Text style={styles.label}>First Name</Text>
                      <TextInput
                        style={[styles.input, touched.firstName && errors.firstName ? styles.inputError : null]}
                        placeholder="First name"
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                      />
                      {touched.firstName && errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
                    </View>

                    {/* Last Name */}
                    <View style={styles.columnContainer}>
                      <Text style={styles.label}>Last Name</Text>
                      <TextInput
                        style={[styles.input, touched.lastName && errors.lastName ? styles.inputError : null]}
                        placeholder="Last name"
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                      />
                      {touched.lastName && errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
                    </View>
                  </View>

                  {/* Date of Birth and Gender in one row */}
                  <View style={[styles.rowContainer, { marginTop: 16 }]}>
                    {/* Date of Birth */}
                    <View style={styles.columnContainer}>
                      <Text style={styles.label}>Date of Birth</Text>
                      <TouchableOpacity style={[styles.input, styles.datePickerButton, touched.dateOfBirth && errors.dateOfBirth ? styles.inputError : null]} onPress={() => setShowDatePicker(true)}>
                        <Text style={values.dateOfBirth ? styles.dateText : styles.placeholderText}>{values.dateOfBirth ? formatDisplayDate(values.dateOfBirth) : "Select date"}</Text>
                        <Ionicons name="calendar" size={20} color="#808080" />
                      </TouchableOpacity>
                      {touched.dateOfBirth && errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}

                      {/* Date Picker for Android */}
                      {Platform.OS === "android" && showDatePicker && (
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display="default"
                          onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date && event.type === "set") {
                              const formattedDate = formatDate(date);
                              setSelectedDate(date);
                              setFieldValue("dateOfBirth", formattedDate);
                            }
                          }}
                          maximumDate={new Date()}
                          minimumDate={new Date(1920, 0, 1)}
                        />
                      )}
                    </View>

                    {/* Gender Dropdown */}
                    <View style={styles.columnContainer}>
                      <Text style={styles.label}>Gender</Text>
                      <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                          style={[styles.input, styles.selectContainer, touched.gender && errors.gender ? styles.inputError : null]}
                          onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                        >
                          <Text style={values.gender ? styles.dateText : styles.placeholderText}>{values.gender || "Select gender"}</Text>
                          <Ionicons name={showGenderDropdown ? "chevron-up" : "chevron-down"} size={20} color="#808080" />
                        </TouchableOpacity>

                        {showGenderDropdown && (
                          <View style={styles.dropdownList}>
                            {genderOptions.map((item) => (
                              <TouchableOpacity
                                key={item.value}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  setFieldValue("gender", item.value);
                                  setShowGenderDropdown(false);
                                }}
                              >
                                <Text style={[styles.dropdownItemText, values.gender === item.value && styles.selectedItemText]}>{item.label}</Text>
                                {values.gender === item.value && <Ionicons name="checkmark" size={16} color="#3F63C7" />}
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                      {touched.gender && errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
                    </View>
                  </View>

                  {/* Email */}
                  <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
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

                  {/* Phone Number */}
                  <Text style={[styles.label, { marginTop: 16 }]}>Phone Number</Text>
                  <View style={styles.phoneContainer}>
                    <MaskInput
                      style={[styles.input, touched.phone && errors.phone ? styles.inputError : null]}
                      value={values.phone}
                      onChangeText={(masked, unmasked) => {
                        setFieldValue("phone", unmasked);
                      }}
                      mask={TEN_DIGIT_MASK}
                      keyboardType="phone-pad"
                      placeholder="Phone number"
                    />
                  </View>
                  {touched.phone && errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

                  {/* Password */}
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

                  {/* Confirm Password */}
                  <Text style={[styles.label, { marginTop: 16 }]}>Confirm Password</Text>
                  <View style={[styles.passwordContainer, touched.confirmPassword && errors.confirmPassword ? styles.inputError : null]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm Password"
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={24} color="#808080" />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

                  <TouchableOpacity style={styles.registerButton} onPress={() => handleSubmit()} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Next</Text>}
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.push("/login")}>
                      <Text style={styles.signupText}>Log in</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
