import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import serviceRequestSignalR from "@/services/ServiceRequestSignalR";
import { AppDispatch } from "@/store/store";
import { updateServiceRequestStatusFromSignalR, handleRequestCancellationFromSignalR, getPendingRequestsByCategory } from "@/store/slice/serviceRequest";

export const useServiceRequestSignalR = (categoryId?: string, customerId?: string) => {
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

      if (categoryId) await serviceRequestSignalR.subscribeToCategoryRequests(categoryId);
      if (customerId) await serviceRequestSignalR.joinCustomerGroup(customerId);
    };

    connectSignalR();

    return () => {
      active = false;
      serviceRequestSignalR.off("RequestStatusUpdated", handleStatusUpdate);
      serviceRequestSignalR.off("NewRequestCreated", handleNewRequest);
      serviceRequestSignalR.off("RequestCancelled", handleCancellation);
      if (categoryId) serviceRequestSignalR.unsubscribeFromCategoryRequests(categoryId);
    };
  }, [categoryId, customerId, dispatch]);

  return { connected, connectionError };
};
