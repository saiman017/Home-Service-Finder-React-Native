// import serviceRequestSignalR from "@/services/ServiceRequestSignalR";
// import { getPendingRequestsByCategory } from "@/store/slice/serviceRequest";

// export const setupServiceRequestSignalR = (
//   userId: string,
//   isProvider: boolean,
//   categoryId?: string,
//   dispatch?: any
// ) => {
//   // Connect to SignalR
//   serviceRequestSignalR.connect().then((connected) => {
//     if (!connected) {
//       console.error("Failed to connect to SignalR");
//       return;
//     }

//     // Join appropriate groups
//     if (isProvider && categoryId) {
//       serviceRequestSignalR.subscribeToCategoryRequests(categoryId);
//       serviceRequestSignalR.joinProviderGroup(userId);
//     } else {
//       serviceRequestSignalR.joinCustomerGroup(userId);
//     }

//     // Listen for status updates
//     serviceRequestSignalR.on("onRequestStatusUpdated", (request) => {
//       if (dispatch) {
//         // Update state through a reducer action
//         dispatch({
//           type: "serviceRequest/statusUpdatedViaSignalR",
//           payload: request,
//         });
//       }
//     });

//     // Listen for your own request updates (customer specific)
//     serviceRequestSignalR.on("onYourRequestStatusUpdated", (request) => {
//       if (dispatch) {
//         dispatch({
//           type: "serviceRequest/myRequestUpdated",
//           payload: request,
//         });
//       }
//     });

//     // Listen for cancellations - Fixed to match backend data structure
//     serviceRequestSignalR.on("onRequestCancelled", (data) => {
//       console.log("Request cancellation received:", data);
//       dispatch?.({
//         type: "serviceRequest/handleRequestCancellationFromSignalR",
//         payload: {
//           requestId: data.RequestId, // Capitalized to match backend
//           categoryId: data.CategoryId,
//           status: "Cancelled", // Capitalized to match backend
//         },
//       });
//       console.log("eeee", data.CategoryId);
//       dispatch(getPendingRequestsByCategory(data.CategoryId));
//     });

//     serviceRequestSignalR.on("onProviderRequestCancelled", (data) => {
//       console.log("Provider request cancellation received:", data);
//       dispatch?.({
//         type: "serviceRequest/handleRequestCancellationFromSignalR",
//         payload: {
//           requestId: data.RequestId, // Capitalized to match backend
//           categoryId: data.CategoryId,
//           status: "Cancelled", // Capitalized to match backend
//         },
//       });
//     });
//   });

//   // Return a cleanup function
//   return () => {
//     serviceRequestSignalR.disconnect();
//   };
// };
