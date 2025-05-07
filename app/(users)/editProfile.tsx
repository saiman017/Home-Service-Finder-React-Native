import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import Header from "@/components/Header";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { editUser, fetchUserById, uploadProfilePicture, selectUserById } from "@/store/slice/user";
import type { AppDispatch, RootState } from "@/store/store";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

export default function EditUserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const IMAGE_API_URL = Constants.expoConfig?.extra?.IMAGE_API_URL ?? "default_value";

  const { userId } = useSelector((state: RootState) => state.auth);
  const currentUser = useSelector(selectUserById);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    profilePicture: "",
  });

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  useEffect(() => {
    const loadUser = async () => {
      if (userId) {
        try {
          await dispatch(fetchUserById(userId));
        } catch (err) {
          Alert.alert("Error", "Failed to load profile");
        } finally {
          setLoading(false);
        }
      }
    };
    loadUser();
  }, [dispatch, userId]);

  useEffect(() => {
    if (currentUser) {
      setInitialValues({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        gender: currentUser.gender || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        profilePicture: currentUser.profilePicture || "",
      });
      setLoading(false);
    }
  }, [currentUser]);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string(),
    gender: Yup.string(),
    dateOfBirth: Yup.string(),
  });

  const formattedDate = (dateString: string) => {
    if (!dateString) return "Select Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3F63C7" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            if (!userId) return;
            setSaving(true);
            try {
              let uploadedProfilePicture = values.profilePicture;

              // Check if a new image is selected (local file)
              if (values.profilePicture && values.profilePicture.startsWith("file")) {
                const fileUri = values.profilePicture;
                const fileName = fileUri.split("/").pop() || "profile.jpg";
                const match = /\.(\w+)$/.exec(fileName);
                const fileType = match ? `image/${match[1]}` : `image`;

                const formData = new FormData();
                formData.append("file", {
                  uri: fileUri,
                  name: fileName,
                  type: fileType,
                } as any);

                // Upload image first
                const uploadResult = await dispatch(uploadProfilePicture({ id: userId, file: formData })).unwrap();
                uploadedProfilePicture = uploadResult.profilePicture; // Get uploaded image path from server
              }

              // Prepare other profile data (excluding image)
              const userData = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phoneNumber: values.phoneNumber,
                gender: values.gender,
                dateOfBirth: values.dateOfBirth,
                profilePicture: uploadedProfilePicture, // Use updated image path
              };

              // Send profile data update
              await dispatch(editUser({ id: userId, userData })).unwrap();

              Alert.alert("Success", "Profile updated successfully");
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to update profile");
            } finally {
              setSaving(false);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isValid, dirty }) => {
            const handleSelectImage = async () => {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "Permission to access camera roll is required!");
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,

                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });

              if (!result.canceled) {
                const selectedAsset = result.assets[0];
                setFieldValue("profilePicture", selectedAsset.uri); // Update Formik value
              }
            };

            return (
              <>
                {/* Profile Image */}
                <View style={styles.profileImageSection}>
                  <View style={styles.profileImageContainer}>
                    {values.profilePicture ? (
                      <Image
                        source={{
                          uri: values.profilePicture.startsWith("file") ? values.profilePicture : `${IMAGE_API_URL}${values.profilePicture}`,
                        }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Ionicons name="person" size={60} color="#FFFFFF" />
                      </View>
                    )}
                    <TouchableOpacity style={styles.editImageButton} onPress={handleSelectImage}>
                      <MaterialIcons name="edit" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} onChangeText={handleChange("firstName")} onBlur={handleBlur("firstName")} value={values.firstName} placeholder="Enter your first name" />
                    {touched.firstName && errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} onChangeText={handleChange("lastName")} onBlur={handleBlur("lastName")} value={values.lastName} placeholder="Enter your last name" />
                    {touched.lastName && errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={handleChange("phoneNumber")}
                      onBlur={handleBlur("phoneNumber")}
                      value={values.phoneNumber}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.dropdownContainer}>
                      <TouchableOpacity
                        style={[styles.input, styles.selectContainer, touched.gender && errors.gender ? styles.inputError : null]}
                        onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                      >
                        <Text style={values.gender ? styles.selectText : styles.placeholderText}>
                          {values.gender ? values.gender.charAt(0).toUpperCase() + values.gender.slice(1) : "Select gender"}
                        </Text>
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

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.dateText}>{formattedDate(values.dateOfBirth)}</Text>
                      <MaterialIcons name="calendar-today" size={24} color="#3F63C7" />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={values.dateOfBirth ? new Date(values.dateOfBirth) : new Date()}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setFieldValue("dateOfBirth", selectedDate.toISOString().split("T")[0]);
                          }
                        }}
                      />
                    )}
                  </View>

                  <TouchableOpacity style={[styles.saveButton, !(dirty && isValid) && { opacity: 0.5 }]} onPress={() => handleSubmit()} disabled={!(dirty && isValid) || saving}>
                    {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                  </TouchableOpacity>
                </View>
              </>
            );
          }}
        </Formik>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centerContent: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 30 },
  profileImageSection: { alignItems: "center", paddingVertical: 24 },
  profileImageContainer: { position: "relative" },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#3F63C7",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C4C4C4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#3F63C7",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3F63C7",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  formContainer: { paddingHorizontal: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#666" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#ff4d4f",
    marginTop: 4,
    fontSize: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  picker: { height: 50 },
  datePickerButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { fontSize: 16, color: "#333" },
  selectText: { fontSize: 16, color: "#000" },
  placeholderText: { fontSize: 16, color: "#9e9e9e" },
  saveButton: {
    backgroundColor: "#3F63C7",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  warningText: {
    color: "#FF9800",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  verifyButton: {
    backgroundColor: "#3F63C7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  // Dropdown styles
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
  },
  selectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputError: {
    borderColor: "#ff4d4f",
  },
  dropdownList: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  selectedItemText: {
    color: "#3F63C7",
    fontWeight: "500",
  },
});
