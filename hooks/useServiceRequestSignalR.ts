// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import serviceRequestSignalR from "@/services/ServiceRequestSignalR";
// import { AppDispatch } from "@/store/store";
// import {
//   updateServiceRequestStatus,
//   getPendingRequestsByCategory,
// } from "@/store/slice/serviceRequest";

// export const useServiceRequestSignalR = (
//   categoryId?: string,
//   currentRequestId?: string
// ) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [connected, setConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);

//   useEffect(() => {
//     let isActive = true;

//     const statusHandler = (updatedRequest: any) => {
//       if (currentRequestId && updatedRequest.id === currentRequestId) {
//         dispatch(
//           updateServiceRequestStatus({
//             requestId: updatedRequest.id,
//             status: updatedRequest.status,
//           })
//         );
//       }
//     };

//     const newRequestHandler = (newRequest: any) => {
//       if (categoryId && newRequest.serviceCategoryId === categoryId) {
//         dispatch(getPendingRequestsByCategory(categoryId));
//       }
//     };

//     const cancelledRequestHandler = (data: any) => {
//       console.log("Processing cancellation from SignalR:", data);

//       // Make sure we're handling the data format correctly
//       const requestId = data.requestId;
//       const categoryId = data.categoryId;
//       const status = data.status;

//       dispatch({
//         type: "serviceRequest/handleRequestCancellationFromSignalR",
//         payload: {
//           requestId,
//           categoryId,
//           status,
//         },
//       });

//       if (categoryId) {
//         console.log("Fetching pending requests for category:", categoryId);
//         dispatch(getPendingRequestsByCategory(categoryId));
//       }
//     };

//     const initSignalR = async () => {
//       try {
//         const connected = await serviceRequestSignalR.connect();
//         if (!connected) throw new Error("Connection failed");

//         setConnected(true);
//         setConnectionError(null);

//         // Register handlers with correct event types
//         serviceRequestSignalR.on("onRequestStatusUpdated", statusHandler);
//         serviceRequestSignalR.on("onNewRequestCreated", newRequestHandler);
//         serviceRequestSignalR.on("onRequestCancelled", cancelledRequestHandler);

//         if (categoryId) {
//           await serviceRequestSignalR.subscribeToCategoryRequests(categoryId);
//         }

//         if (currentRequestId) {
//           // Join the specific request group if needed
//           // This depends on your backend implementation
//         }
//       } catch (error) {
//         if (isActive) {
//           setConnected(false);
//           setConnectionError(
//             error instanceof Error ? error.message : "Connection error"
//           );
//         }
//       }
//     };

//     initSignalR();

//     return () => {
//       isActive = false;

//       // Cleanup handlers
//       serviceRequestSignalR.off("onRequestStatusUpdated", statusHandler);
//       serviceRequestSignalR.off("onNewRequestCreated", newRequestHandler);
//       serviceRequestSignalR.off("onRequestCancelled", cancelledRequestHandler);

//       if (categoryId) {
//         serviceRequestSignalR.unsubscribeFromCategoryRequests(categoryId);
//       }
//     };
//   }, [categoryId, currentRequestId, dispatch]);

//   return { connected, connectionError };
// };
// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import serviceRequestSignalR from "@/services/ServiceRequestSignalR";
// import { AppDispatch } from "@/store/store";
// import {
//   updateServiceRequestStatusFromSignalR,
//   handleRequestCancellationFromSignalR,
//   getPendingRequestsByCategory,
// } from "@/store/slice/serviceRequest";

// export const useServiceRequestSignalR = (
//   categoryId?: string,
//   customerId?: string
// ) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [connected, setConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);

//   useEffect(() => {
//     let active = true;

//     const handleStatusUpdate = (data: any) => {
//       dispatch(
//         updateServiceRequestStatusFromSignalR({
//           requestId: data.id,
//           status: data.status,
//         })
//       );
//     };

//     const handleNewRequest = (data: any) => {
//       if (categoryId && data.serviceCategoryId === categoryId) {
//         dispatch(getPendingRequestsByCategory(categoryId));
//       }
//     };

//     const handleCancellation = (data: any) => {
//       console.log("Cancellation:", data);
//       dispatch(
//         handleRequestCancellationFromSignalR({
//           requestId: data.requestId,
//           categoryId: data.categoryId,
//           status: data.status,
//         })
//       );
//     };

//     const connectSignalR = async () => {
//       const isConnected = await serviceRequestSignalR.connect();
//       if (!isConnected) {
//         if (active) setConnectionError("Connection failed");
//         return;
//       }

//       if (active) {
//         setConnected(true);
//         setConnectionError(null);
//       }

//       serviceRequestSignalR.on("onRequestStatusUpdated", handleStatusUpdate);
//       serviceRequestSignalR.on("onNewRequestCreated", handleNewRequest);
//       serviceRequestSignalR.on("onRequestCancelled", handleCancellation);

//       if (categoryId)
//         await serviceRequestSignalR.subscribeToCategoryRequests(categoryId);
//       if (customerId) await serviceRequestSignalR.joinCustomerGroup(customerId);
//     };

//     connectSignalR();

//     return () => {
//       active = false;
//       serviceRequestSignalR.off("onRequestStatusUpdated", handleStatusUpdate);
//       serviceRequestSignalR.off("onNewRequestCreated", handleNewRequest);
//       serviceRequestSignalR.off("onRequestCancelled", handleCancellation);
//       if (categoryId)
//         serviceRequestSignalR.unsubscribeFromCategoryRequests(categoryId);
//     };
//   }, [categoryId, customerId, dispatch]);

//   return { connected, connectionError };
// };
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import serviceRequestSignalR from "@/services/ServiceRequestSignalR";
import { AppDispatch } from "@/store/store";
import {
  updateServiceRequestStatusFromSignalR,
  handleRequestCancellationFromSignalR,
  getPendingRequestsByCategory,
} from "@/store/slice/serviceRequest";

export const useServiceRequestSignalR = (
  categoryId?: string,
  customerId?: string
) => {
  const dispatch = useDispatch<AppDispatch>();
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const handleStatusUpdate = (data: any) => {
      dispatch(
        updateServiceRequestStatusFromSignalR({
          requestId: data.id,
          status: data.status,
        })
      );
    };

    const handleNewRequest = (data: any) => {
      if (categoryId && data.serviceCategoryId === categoryId) {
        dispatch(getPendingRequestsByCategory(categoryId));
      }
    };

    const handleCancellation = (data: any) => {
      dispatch(
        handleRequestCancellationFromSignalR({
          requestId: data.requestId,
          categoryId: data.categoryId,
          status: data.status,
        })
      );
    };

    const connectSignalR = async () => {
      const isConnected = await serviceRequestSignalR.connect();
      if (!isConnected) {
        if (active) setConnectionError("Connection failed");
        return;
      }

      if (active) {
        setConnected(true);
        setConnectionError(null);
      }

      serviceRequestSignalR.on("RequestStatusUpdated", handleStatusUpdate);
      serviceRequestSignalR.on("NewRequestCreated", handleNewRequest);
      serviceRequestSignalR.on("RequestCancelled", handleCancellation);

      if (categoryId)
        await serviceRequestSignalR.subscribeToCategoryRequests(categoryId);
      if (customerId) await serviceRequestSignalR.joinCustomerGroup(customerId);
    };

    connectSignalR();

    return () => {
      active = false;
      serviceRequestSignalR.off("RequestStatusUpdated", handleStatusUpdate);
      serviceRequestSignalR.off("NewRequestCreated", handleNewRequest);
      serviceRequestSignalR.off("RequestCancelled", handleCancellation);
      if (categoryId)
        serviceRequestSignalR.unsubscribeFromCategoryRequests(categoryId);
    };
  }, [categoryId, customerId, dispatch]);

  return { connected, connectionError };
};
