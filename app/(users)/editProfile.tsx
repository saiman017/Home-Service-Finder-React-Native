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
import MaskInput from "react-native-mask-input";

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

  // 10-digit numeric mask
  const TEN_DIGIT_MASK = Array(10).fill(/\d/);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      try {
        await dispatch(fetchUserById(userId));
      } catch {
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, userId]);

  useEffect(() => {
    if (!currentUser) return;
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
  }, [currentUser]);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required")
      .matches(/^[A-Z][a-zA-Z]*$/, "Must start with a capital letter"),
    lastName: Yup.string()
      .required("Last name is required")
      .matches(/^[A-Z][a-zA-Z]*$/, "Must start with a capital letter"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    gender: Yup.string().required("Gender is required"),
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .test("is-old-enough", "You must be at least 18 years old", (value) => {
        if (!value) return false;
        const today = new Date();
        const birth = new Date(value);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 18;
      }),
  });

  const formattedDate = (dateString: string) => {
    if (!dateString) return "Select Date";
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
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
          validateOnMount={true}
          validateOnChange={true}
          validateOnBlur={true}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            if (!userId) return;
            setSaving(true);
            try {
              let uploadedProfilePicture = values.profilePicture;

              // If user selected a local file, upload it first
              if (values.profilePicture.startsWith("file")) {
                const uri = values.profilePicture;
                const name = uri.split("/").pop()!;
                const extMatch = /\.(\w+)$/.exec(name);
                const type = extMatch ? `image/${extMatch[1]}` : "image";

                const formData = new FormData();
                formData.append("file", {
                  uri,
                  name,
                  type,
                } as any);

                const uploadRes = await dispatch(uploadProfilePicture({ id: userId, file: formData })).unwrap();
                uploadedProfilePicture = uploadRes.profilePicture;
              }

              // Then send the rest of the profile data
              await dispatch(
                editUser({
                  id: userId,
                  userData: {
                    ...values,
                    profilePicture: uploadedProfilePicture,
                  },
                })
              ).unwrap();

              Alert.alert("Success", "Profile updated successfully");
              router.back();
            } catch {
              Alert.alert("Error", "Failed to update profile");
            } finally {
              setSaving(false);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isValid, dirty }) => {
            const pickImage = async () => {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) {
                return Alert.alert("Permission denied", "We need camera roll permission to update your photo");
              }
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });
              if (!res.canceled) {
                setFieldValue("profilePicture", res.assets[0].uri);
              }
            };

            return (
              <>
                {/* Profile photo */}
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
                        <Ionicons name="person" size={60} color="#fff" />
                      </View>
                    )}
                    <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
                      <MaterialIcons name="edit" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formContainer}>
                  {/* First Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} onChangeText={handleChange("firstName")} onBlur={handleBlur("firstName")} value={values.firstName} placeholder="Enter your first name" />
                    {touched.firstName && errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                  </View>

                  {/* Last Name */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} onChangeText={handleChange("lastName")} onBlur={handleBlur("lastName")} value={values.lastName} placeholder="Enter your last name" />
                    {touched.lastName && errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput style={[styles.input, styles.disabledInput]} value={values.email} editable={false} />
                  </View>

                  {/* Phone Number */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <MaskInput
                      style={[styles.input, touched.phoneNumber && errors.phoneNumber ? styles.inputError : null]}
                      value={values.phoneNumber}
                      onChangeText={(_, unmasked) => setFieldValue("phoneNumber", unmasked)}
                      mask={TEN_DIGIT_MASK}
                      keyboardType="phone-pad"
                      placeholder="1234567890"
                    />
                    {touched.phoneNumber && errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                  </View>

                  {/* Gender */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Gender</Text>
                    <TouchableOpacity style={[styles.input, styles.selectContainer, touched.gender && errors.gender ? styles.inputError : null]} onPress={() => setShowGenderDropdown((v) => !v)}>
                      <Text style={values.gender ? styles.selectText : styles.placeholderText}>{values.gender ? values.gender.charAt(0).toUpperCase() + values.gender.slice(1) : "Select gender"}</Text>
                      <Ionicons name={showGenderDropdown ? "chevron-up" : "chevron-down"} size={20} color="#808080" />
                    </TouchableOpacity>
                    {showGenderDropdown && (
                      <View style={styles.dropdownList}>
                        {genderOptions.map((opt) => (
                          <TouchableOpacity
                            key={opt.value}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFieldValue("gender", opt.value);
                              setShowGenderDropdown(false);
                            }}
                          >
                            <Text style={[styles.dropdownItemText, values.gender === opt.value && styles.selectedItemText]}>{opt.label}</Text>
                            {values.gender === opt.value && <Ionicons name="checkmark" size={16} color="#3F63C7" />}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {touched.gender && errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                  </View>

                  {/* Date of Birth */}
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
                        onChange={(_, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setFieldValue("dateOfBirth", selectedDate.toISOString().split("T")[0]);
                          }
                        }}
                      />
                    )}
                    {touched.dateOfBirth && errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
                  </View>

                  {/* Save Button */}
                  <TouchableOpacity onPress={() => handleSubmit()} disabled={!(dirty && isValid) || saving} style={[styles.saveButton, (!(dirty && isValid) || saving) && { opacity: 0.5 }]}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
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
  container: { flex: 1, backgroundColor: "#fff" },
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
    borderColor: "#fff",
  },
  formContainer: { paddingHorizontal: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#666" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: { borderColor: "#ff4d4f" },
  errorText: { color: "#ff4d4f", marginTop: 4, fontSize: 12 },

  selectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: { fontSize: 16, color: "#000" },
  placeholderText: { fontSize: 16, color: "#9e9e9e" },
  disabledInput: {
    backgroundColor: "#FFFFFF",
  },

  dropdownList: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 10,
    marginTop: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownItemText: { fontSize: 16, color: "#000" },
  selectedItemText: { color: "#3F63C7", fontWeight: "500" },

  datePickerButton: {
    backgroundColor: "#fff",
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

  saveButton: {
    backgroundColor: "#3F63C7",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
