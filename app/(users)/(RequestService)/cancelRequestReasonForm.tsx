// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   SafeAreaView,
// //   KeyboardAvoidingView,
// //   Platform,
// //   ScrollView,
// //   ActivityIndicator,
// //   Alert,
// // } from "react-native";
// // import { router, useLocalSearchParams } from "expo-router";
// // import { useDispatch, useSelector } from "react-redux";
// // import { AppDispatch, RootState } from "@/store/store";
// // import Header from "@/components/Header";
// // import { cancelServiceRequestWithReason } from "@/store/slice/serviceRequest";
// // import serviceRequestSignalR from "@/services/ServiceRequestSignalR";

// // export default function CancelRequestReasonForm() {
// //   const [reason, setReason] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState("");

// //   const { serviceRequestId } = useLocalSearchParams<{
// //     serviceRequestId: string;
// //   }>();
// //   const customerId = useSelector((state: RootState) => state.auth.userId); // ✅ Get from Redux
// //   const dispatch = useDispatch<AppDispatch>();

// //   useEffect(() => {
// //     if (!serviceRequestId || !customerId) {
// //       Alert.alert("Error", "Missing request or customer information.", [
// //         { text: "OK", onPress: () => router.back() },
// //       ]);
// //     }
// //   }, [serviceRequestId, customerId]);

// //   const handleSubmit = async () => {
// //     if (!reason.trim()) {
// //       setError("Please provide a reason");
// //       return;
// //     }

// //     setIsLoading(true);
// //     setError("");

// //     try {
// //       // 1. Cancel request
// //       const response = await dispatch(
// //         cancelServiceRequestWithReason({
// //           requestId: serviceRequestId!,
// //           customerId: customerId!,
// //           reason,
// //         })
// //       ).unwrap();
// //       console.log("Cancellation response:", response);

// //       // 2. Notify provider via SignalR (include providerId)
// //       if (response?.providerId) {
// //         await serviceRequestSignalR.notifyProviderRequestCancelled({
// //           requestId: serviceRequestId!,
// //           providerId: response.providerId,
// //           customerId: customerId!,
// //         });
// //       }

// //       // 3. Alert and redirect customer
// //       Alert.alert(
// //         "Request Cancelled",
// //         "Your service request has been cancelled.",
// //         [{ text: "OK", onPress: () => router.replace("/(tabs)/home") }]
// //       );
// //     } catch (error) {
// //       console.error("Cancellation error:", error);
// //       setError("Failed to cancel request. Please try again.");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <Header title="Cancel Service Request" showBackButton={true} />
// //       <KeyboardAvoidingView
// //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// //         style={styles.container}
// //       >
// //         <ScrollView style={styles.scrollView}>
// //           <View style={styles.inner}>
// //             <Text style={styles.label}>Reason for Cancellation</Text>
// //             <TextInput
// //               style={[styles.input, error ? styles.inputError : null]}
// //               placeholder="Explain why you're cancelling this request..."
// //               value={reason}
// //               onChangeText={(text) => {
// //                 setReason(text);
// //                 if (error) setError("");
// //               }}
// //               multiline
// //               numberOfLines={5}
// //               textAlignVertical="top"
// //             />
// //             {error ? <Text style={styles.errorText}>{error}</Text> : null}
// //             <TouchableOpacity
// //               style={styles.submitButton}
// //               onPress={handleSubmit}
// //               disabled={isLoading}
// //             >
// //               {isLoading ? (
// //                 <ActivityIndicator color="#fff" />
// //               ) : (
// //                 <Text style={styles.submitButtonText}>Submit Cancellation</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </ScrollView>
// //       </KeyboardAvoidingView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "white" },
// //   scrollView: { flex: 1 },
// //   inner: { flex: 1, padding: 24 },
// //   label: { marginBottom: 8, color: "#808080" },
// //   input: {
// //     minHeight: 120,
// //     borderWidth: 1,
// //     borderColor: "#dedede",
// //     borderRadius: 10,
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     backgroundColor: "#ffffff",
// //     fontSize: 16,
// //   },
// //   inputError: { borderColor: "#ff4d4f" },
// //   errorText: { color: "#ff4d4f", marginTop: 4, fontSize: 12 },
// //   submitButton: {
// //     height: 55,
// //     backgroundColor: "#FF5252",
// //     borderRadius: 10,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginTop: 30,
// //   },
// //   submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
// // });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store/store";
// import Header from "@/components/Header";
// import { cancelServiceRequestWithReason } from "@/store/slice/serviceRequest";
// import serviceRequestSignalR from "@/services/ServiceRequestSignalR";
// import { clearCurrentOffer } from "@/store/slice/serviceOffer";
// import {
//   clearServiceRequestData,
//   resetServiceRequestState,
// } from "@/store/slice/serviceRequest";

// export default function CancelRequestReasonForm() {
//   const [reason, setReason] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const { serviceRequestId, providerId } = useLocalSearchParams<{
//     serviceRequestId: string;
//     providerId: string;
//   }>();
//   const customerId = useSelector((state: RootState) => state.auth.userId);
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     if (!serviceRequestId || !customerId || !providerId) {
//       Alert.alert("Error", "Missing request or provider information.", [
//         { text: "OK", onPress: () => router.back() },
//       ]);
//     }
//   }, [serviceRequestId, customerId, providerId]);

//   const handleSubmit = async () => {
//     if (!reason.trim()) {
//       setError("Please provide a reason");
//       return;
//     }

//     setIsLoading(true);
//     setError("");

//     try {
//       // 1. Cancel request
//       await dispatch(
//         cancelServiceRequestWithReason({
//           requestId: serviceRequestId!,
//           customerId: customerId!,
//           reason,
//         })
//       ).unwrap();

//       // 2. Notify provider via SignalR (use providerId from params)
//       await serviceRequestSignalR.notifyProviderRequestCancelled({
//         requestId: serviceRequestId!,
//         providerId: providerId!,
//         customerId: customerId!,
//       });

//       // 3. Alert and redirect customer
//       Alert.alert(
//         "Request Cancelled",
//         "Your service request has been cancelled.",
//         [
//           {
//             text: "OK",
//             onPress: () => {
//               router.replace("/(tabs)/home");
//               dispatch(clearCurrentOffer());
//               dispatch(clearServiceRequestData());
//               dispatch(resetServiceRequestState());
//               // dispatch(clearServiceRequestData());
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       console.error("Cancellation error:", error);
//       setError("Failed to cancel request. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Header title="Cancel Service Request" showBackButton={true} />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.container}
//       >
//         <ScrollView style={styles.scrollView}>
//           <View style={styles.inner}>
//             <Text style={styles.label}>Reason for Cancellation</Text>
//             <TextInput
//               style={[styles.input, error ? styles.inputError : null]}
//               placeholder="Explain why you're cancelling this request..."
//               value={reason}
//               onChangeText={(text) => {
//                 setReason(text);
//                 if (error) setError("");
//               }}
//               multiline
//               numberOfLines={5}
//               textAlignVertical="top"
//             />
//             {error ? <Text style={styles.errorText}>{error}</Text> : null}
//             <TouchableOpacity
//               style={styles.submitButton}
//               onPress={handleSubmit}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Submit Cancellation</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },
//   scrollView: { flex: 1 },
//   inner: { flex: 1, padding: 24 },
//   label: { marginBottom: 8, color: "#808080" },
//   input: {
//     minHeight: 120,
//     borderWidth: 1,
//     borderColor: "#dedede",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: "#ffffff",
//     fontSize: 16,
//   },
//   inputError: { borderColor: "#ff4d4f" },
//   errorText: { color: "#ff4d4f", marginTop: 4, fontSize: 12 },
//   submitButton: {
//     height: 55,
//     backgroundColor: "#FF5252",
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 30,
//   },
//   submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
// });
