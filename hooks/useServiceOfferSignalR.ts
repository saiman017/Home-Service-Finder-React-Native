import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import serviceOfferSignalR from "@/services/ServiceOfferSignalR";
import { AppDispatch, RootState } from "@/store/store";
import {
  addNewOffer,
  updateOfferFromSignalR,
  handleOfferAcceptedFromSignalR,
  handleOfferRejectedFromSignalR,
  handleOfferExpiredFromSignalR,
  handlePaymentUpdatedFromSignalR,
  clearCurrentOffer,
} from "@/store/slice/serviceOffer";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export const useServiceOfferSignalR = (providerId?: string | null, requestId?: string | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { role } = useSelector((state: RootState) => state.auth);
  const [connected, setConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const MAX_RETRIES = 5;
  const activeRequestIdRef = useRef<string | null>(requestId || null);

  const handlersRef = useRef<any>(null);

  const setupHandlers = useCallback(
    () => ({
      NewOfferReceived: (offer: any) => dispatch(addNewOffer(offer)),
      OfferStatusUpdated: (offer: any) => {
        if (offer.serviceRequestId !== activeRequestIdRef.current) return;
        dispatch(updateOfferFromSignalR(offer));
      },
      YourOfferAccepted: (offer: any) => {
        dispatch(clearCurrentOffer());
        dispatch(handleOfferAcceptedFromSignalR(offer));
        if (role === "serviceProvider") {
          Alert.alert("Offer Accepted", "Your offer has been accepted!", [
            {
              text: "Go to Workflow",
              onPress: () => {
                router.replace({
                  pathname: "/(serviceProvider)/ServiceProviderWorkflow",
                  params: {
                    offerId: offer.id,
                    serviceRequestId: offer.serviceRequestId,
                  },
                });
              },
            },
          ]);
        }
      },
      YourOfferRejected: (offer: any) => dispatch(handleOfferRejectedFromSignalR(offer)),
      YourOfferExpired: (offer: any) => dispatch(handleOfferExpiredFromSignalR(offer)),
      OfferPaymentUpdated: (offer: any) => {
        if (offer.serviceRequestId !== activeRequestIdRef.current) return;
        dispatch(handlePaymentUpdatedFromSignalR(offer));
      },
    }),
    [dispatch, router, role]
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      activeRequestIdRef.current = requestId || null;
      handlersRef.current = setupHandlers();

      const connectSignalR = async () => {
        const success = await serviceOfferSignalR.connect();
        if (!success && isActive && reconnectAttempts.current < MAX_RETRIES) {
          reconnectAttempts.current++;
          setTimeout(connectSignalR, 2000);
          return;
        }
        if (!isActive || !success) return;

        Object.entries(handlersRef.current).forEach(([event, handler]) => {
          serviceOfferSignalR.on(event as any, handler as any);
        });

        if (providerId) await serviceOfferSignalR.joinProviderOffersGroup(providerId);
        if (requestId) await serviceOfferSignalR.joinRequestOffersGroup(requestId);

        if (isActive) setConnected(true);
      };

      connectSignalR();

      return () => {
        isActive = false;
        Object.entries(handlersRef.current).forEach(([event, handler]) => {
          serviceOfferSignalR.off(event as any, handler as any);
        });
        setConnected(false);
      };
    }, [providerId, requestId, setupHandlers])
  );

  return { connected };
};
