// import { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import serviceOfferSignalR from "@/services/ServiceOfferSignalR";
// import { AppDispatch } from "@/store/store";
// import {
//   addNewOffer,
//   updateOfferFromSignalR,
//   handleOfferAcceptedFromSignalR,
//   handleOfferRejectedFromSignalR,
//   handleOfferExpiredFromSignalR,
// } from "@/store/slice/serviceOffer";

// export const useServiceOfferSignalR = (
//   providerId?: string,
//   requestId?: string
// ) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [connected, setConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);

//   useEffect(() => {
//     let isActive = true;

//     // Handler for when a new offer is received for a request
//     const newOfferHandler = (offer: any) => {
//       console.log("New offer received:", offer);
//       dispatch(addNewOffer(offer));
//     };

//     // Handler for when provider's offer is accepted
//     const yourOfferAcceptedHandler = (offer: any) => {
//       console.log("Your offer was accepted:", offer);
//       dispatch(handleOfferAcceptedFromSignalR(offer));
//     };

//     // Handler for when an offer for a request is accepted
//     const requestOfferAcceptedHandler = (offer: any) => {
//       console.log("Request offer accepted:", offer);
//       dispatch(handleOfferAcceptedFromSignalR(offer));
//     };

//     // Handler for when provider's offer is rejected
//     const yourOfferRejectedHandler = (offer: any) => {
//       console.log("Your offer was rejected:", offer);
//       dispatch(handleOfferRejectedFromSignalR(offer));
//     };

//     // Handler for when any offer status is updated
//     const offerStatusUpdatedHandler = (offer: any) => {
//       console.log("Offer status updated:", offer);
//       dispatch(updateOfferFromSignalR(offer));
//     };

//     // Handler for when your offer status is updated
//     const yourOfferStatusUpdatedHandler = (offer: any) => {
//       console.log("Your offer status updated:", offer);
//       dispatch(updateOfferFromSignalR(offer));
//     };

//     // Handler for when your offer expires
//     const yourOfferExpiredHandler = (offer: any) => {
//       console.log("Your offer expired:", offer);
//       dispatch(handleOfferExpiredFromSignalR(offer));
//     };

//     // Handler for when any offer expires
//     const offerExpiredHandler = (offer: any) => {
//       console.log("Offer expired:", offer);
//       dispatch(handleOfferExpiredFromSignalR(offer));
//     };

//     const initSignalR = async () => {
//       try {
//         const connected = await serviceOfferSignalR.connect();
//         if (!connected) throw new Error("Connection failed");

//         setConnected(true);
//         setConnectionError(null);

//         // Register event handlers
//         serviceOfferSignalR.on("onNewOfferReceived", newOfferHandler);
//         serviceOfferSignalR.on("onYourOfferAccepted", yourOfferAcceptedHandler);
//         serviceOfferSignalR.on(
//           "onRequestOfferAccepted",
//           requestOfferAcceptedHandler
//         );
//         serviceOfferSignalR.on("onYourOfferRejected", yourOfferRejectedHandler);
//         serviceOfferSignalR.on(
//           "onOfferStatusUpdated",
//           offerStatusUpdatedHandler
//         );
//         serviceOfferSignalR.on(
//           "onYourOfferStatusUpdated",
//           yourOfferStatusUpdatedHandler
//         );
//         serviceOfferSignalR.on("onYourOfferExpired", yourOfferExpiredHandler);
//         serviceOfferSignalR.on("onOfferExpired", offerExpiredHandler);

//         // Join relevant groups based on provided IDs
//         if (providerId) {
//           await serviceOfferSignalR.joinProviderOffersGroup(providerId);
//         }

//         if (requestId) {
//           await serviceOfferSignalR.joinRequestOffersGroup(requestId);
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

//       // Remove all event handlers
//       serviceOfferSignalR.off("onNewOfferReceived", newOfferHandler);
//       serviceOfferSignalR.off("onYourOfferAccepted", yourOfferAcceptedHandler);
//       serviceOfferSignalR.off(
//         "onRequestOfferAccepted",
//         requestOfferAcceptedHandler
//       );
//       serviceOfferSignalR.off("onYourOfferRejected", yourOfferRejectedHandler);
//       serviceOfferSignalR.off(
//         "onOfferStatusUpdated",
//         offerStatusUpdatedHandler
//       );
//       serviceOfferSignalR.off(
//         "onYourOfferStatusUpdated",
//         yourOfferStatusUpdatedHandler
//       );
//       serviceOfferSignalR.off("onYourOfferExpired", yourOfferExpiredHandler);
//       serviceOfferSignalR.off("onOfferExpired", offerExpiredHandler);
//     };
//   }, [providerId, requestId, dispatch]);

//   return { connected, connectionError };
// };
// Hook: useServiceOfferSignalR.ts

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "expo-router";
// import serviceOfferSignalR from "@/services/ServiceOfferSignalR";
// import { AppDispatch, RootState } from "@/store/store";
// import {
//   addNewOffer,
//   updateOfferFromSignalR,
//   handleOfferAcceptedFromSignalR,
//   handleOfferRejectedFromSignalR,
//   handleOfferExpiredFromSignalR,
// } from "@/store/slice/serviceOffer";
// import { Alert } from "react-native";

// export const useServiceOfferSignalR = (
//   providerId?: string | null,
//   requestId?: string | null
// ) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const { role } = useSelector((state: RootState) => state.auth);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     let isActive = true;

//     const handlers = {
//       NewOfferReceived: (offer: any) => dispatch(addNewOffer(offer)),
//       OfferStatusUpdated: (offer: any) =>
//         dispatch(updateOfferFromSignalR(offer)),
//       YourOfferAccepted: (offer: any) => {
//         dispatch(handleOfferAcceptedFromSignalR(offer));
//         console.log("Offer accepted event:", offer);
//         Alert.alert("Offer Accepted", "Navigating to workflow!");
//         if (role === "serviceProvider") {
//           Alert.alert(
//             "Offer Accepted",
//             "Your offer has been accepted by the customer!",
//             [
//               {
//                 text: "Go to Workflow",
//                 onPress: () => {
//                   router.replace({
//                     pathname: "/(serviceProvider)/ServiceProviderWorkflow",
//                     params: {
//                       offerId: offer.id,
//                       serviceRequestId: offer.serviceRequestId,
//                     },
//                   });
//                 },
//               },
//             ]
//           );
//         }
//       },

//       YourOfferRejected: (offer: any) =>
//         dispatch(handleOfferRejectedFromSignalR(offer)),
//       YourOfferExpired: (offer: any) =>
//         dispatch(handleOfferExpiredFromSignalR(offer)),
//     };

//     const connectSignalR = async () => {
//       const success = await serviceOfferSignalR.connect();
//       if (!success || !isActive) return;

//       Object.entries(handlers).forEach(([event, handler]) => {
//         serviceOfferSignalR.on(event as any, handler);
//       });

//       if (providerId) {
//         await serviceOfferSignalR.joinProviderOffersGroup(providerId);
//       }
//       if (requestId) {
//         await serviceOfferSignalR.joinRequestOffersGroup(requestId);
//       }

//       setConnected(true);
//     };

//     connectSignalR();

//     return () => {
//       isActive = false;
//       Object.entries(handlers).forEach(([event, handler]) => {
//         serviceOfferSignalR.off(event as any, handler);
//       });
//     };
//   }, [providerId, requestId, dispatch, role, router]);

//   return { connected };
// };

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "expo-router";
// import serviceOfferSignalR from "@/services/ServiceOfferSignalR";
// import { AppDispatch, RootState } from "@/store/store";
// import {
//   addNewOffer,
//   updateOfferFromSignalR,
//   handleOfferAcceptedFromSignalR,
//   handleOfferRejectedFromSignalR,
//   handleOfferExpiredFromSignalR,
// } from "@/store/slice/serviceOffer";
// import { Alert } from "react-native";

// export const useServiceOfferSignalR = (
//   providerId?: string | null,
//   requestId?: string | null
// ) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const { role } = useSelector((state: RootState) => state.auth);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     let isActive = true;

//     const handlers = {
//       NewOfferReceived: (offer: any) => dispatch(addNewOffer(offer)),
//       OfferStatusUpdated: (offer: any) =>
//         dispatch(updateOfferFromSignalR(offer)),
//       YourOfferAccepted: (offer: any) => {
//         dispatch(handleOfferAcceptedFromSignalR(offer));
//         console.log("Offer accepted event:", offer);
//         if (role === "serviceProvider") {
//           Alert.alert(
//             "Offer Accepted",
//             "Your offer has been accepted by the customer!",
//             [
//               {
//                 text: "Go to Workflow",
//                 onPress: () => {
//                   router.replace({
//                     pathname: "/(serviceProvider)/ServiceProviderWorkflow",
//                     params: {
//                       offerId: offer.id,
//                       serviceRequestId: offer.serviceRequestId,
//                     },
//                   });
//                 },
//               },
//             ]
//           );
//         }
//       },
//       YourOfferRejected: (offer: any) =>
//         dispatch(handleOfferRejectedFromSignalR(offer)),
//       YourOfferExpired: (offer: any) =>
//         dispatch(handleOfferExpiredFromSignalR(offer)),
//     };

//     const connectSignalR = async () => {
//       const success = await serviceOfferSignalR.connect();
//       if (!success || !isActive) return;

//       // Attach event handlers
//       Object.entries(handlers).forEach(([event, handler]) => {
//         serviceOfferSignalR.on(event as any, handler);
//       });

//       if (providerId) {
//         await serviceOfferSignalR.joinProviderOffersGroup(providerId);
//       }
//       if (requestId) {
//         await serviceOfferSignalR.joinRequestOffersGroup(requestId);
//       }

//       setConnected(true);
//     };

//     connectSignalR();

//     return () => {
//       isActive = false;
//       Object.entries(handlers).forEach(([event, handler]) => {
//         serviceOfferSignalR.off(event as any, handler);
//       });
//     };
//   }, [providerId, requestId, dispatch, role, router]);

//   return { connected };
// };

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "expo-router";
// import serviceOfferSignalR from "@/services/ServiceOfferSignalR";
// import { AppDispatch, RootState } from "@/store/store";
// import {
//   addNewOffer,
//   updateOfferFromSignalR,
//   handleOfferAcceptedFromSignalR,
//   handleOfferRejectedFromSignalR,
//   handleOfferExpiredFromSignalR,
// } from "@/store/slice/serviceOffer";
// import { Alert } from "react-native";

// export const useServiceOfferSignalR = (
//   providerId?: string | null,
//   requestId?: string | null
// ) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const { role } = useSelector((state: RootState) => state.auth);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     let isActive = true;

//     const handlers = {
//       NewOfferReceived: (offer: any) => dispatch(addNewOffer(offer)),

//       OfferStatusUpdated: (offer: any) => {
//         console.log("Offer status updated event (Customer):", offer);
//         dispatch(updateOfferFromSignalR(offer));
//         if (role === "customer") {
//           if (offer.status === "In_Progress") {
//             Alert.alert(
//               "Provider Update",
//               "The service provider has reached your location and started the work."
//             );
//           } else if (offer.status === "Completed") {
//             Alert.alert(
//               "Provider Update",
//               "The service provider has completed the work.",
//               [
//                 {
//                   text: "Go to Home",
//                   onPress: () => router.replace("/(tabs)/home"),
//                 },
//               ]
//             );
//           }
//         }
//       },

//       YourOfferAccepted: (offer: any) => {
//         dispatch(handleOfferAcceptedFromSignalR(offer));
//         console.log("Offer accepted event:", offer);
//         if (role === "serviceProvider") {
//           Alert.alert(
//             "Offer Accepted",
//             "Your offer has been accepted by the customer!",
//             [
//               {
//                 text: "Go to Workflow",
//                 onPress: () => {
//                   router.replace({
//                     pathname: "/(serviceProvider)/ServiceProviderWorkflow",
//                     params: {
//                       offerId: offer.id,
//                       serviceRequestId: offer.serviceRequestId,
//                     },
//                   });
//                 },
//               },
//             ]
//           );
//         }
//       },

//       YourOfferRejected: (offer: any) =>
//         dispatch(handleOfferRejectedFromSignalR(offer)),
//       YourOfferExpired: (offer: any) =>
//         dispatch(handleOfferExpiredFromSignalR(offer)),
//     };

//     const connectSignalR = async () => {
//       const success = await serviceOfferSignalR.connect();
//       if (!success || !isActive) return;

//       // Attach event handlers
//       Object.entries(handlers).forEach(([event, handler]) => {
//         serviceOfferSignalR.on(event as any, handler);
//       });

//       if (providerId) {
//         await serviceOfferSignalR.joinProviderOffersGroup(providerId);
//       }
//       if (requestId) {
//         await serviceOfferSignalR.joinRequestOffersGroup(requestId);
//       }

//       setConnected(true);
//     };

//     connectSignalR();

//     return () => {
//       isActive = false;
//       Object.entries(handlers).forEach(([event, handler]) => {
//         serviceOfferSignalR.off(event as any, handler);
//       });
//     };
//   }, [providerId, requestId, dispatch, role, router]);

//   return { connected };
// };
import { useEffect, useState, useCallback } from "react";
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
  clearCurrentOffer,
} from "@/store/slice/serviceOffer";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export const useServiceOfferSignalR = (
  providerId?: string | null,
  requestId?: string | null
) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { role } = useSelector((state: RootState) => state.auth);
  const [connected, setConnected] = useState(false);

  // Always reconnect when the screen refocuses
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const handlers = {
        NewOfferReceived: (offer: any) => dispatch(addNewOffer(offer)),

        OfferStatusUpdated: (offer: any) => {
          console.log("Offer status updated event (Customer):", offer);
          dispatch(updateOfferFromSignalR(offer));

          if (role === "customer") {
            if (offer.status === "In_Progress") {
              Alert.alert(
                "Provider Update",
                "The service provider has reached your location and started the work."
              );
            } else if (offer.status === "Completed") {
              Alert.alert(
                "Provider Update",
                "The service provider has completed the work.",
                [
                  {
                    text: "Go to Home",
                    onPress: () => router.replace("/(tabs)/home"),
                  },
                ]
              );
            }
          }
        },

        YourOfferAccepted: (offer: any) => {
          dispatch(clearCurrentOffer());
          dispatch(handleOfferAcceptedFromSignalR(offer));
          console.log("Offer accepted event:", offer);
          if (role === "serviceProvider") {
            Alert.alert(
              "Offer Accepted",
              "Your offer has been accepted by the customer!",
              [
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
              ]
            );
          }
        },

        YourOfferRejected: (offer: any) =>
          dispatch(handleOfferRejectedFromSignalR(offer)),

        YourOfferExpired: (offer: any) =>
          dispatch(handleOfferExpiredFromSignalR(offer)),
      };

      const connectSignalR = async () => {
        const success = await serviceOfferSignalR.connect();
        if (!success || !isActive) return;

        // Attach handlers
        Object.entries(handlers).forEach(([event, handler]) => {
          serviceOfferSignalR.on(event as any, handler);
        });

        if (providerId) {
          await serviceOfferSignalR.joinProviderOffersGroup(providerId);
        }
        if (requestId) {
          await serviceOfferSignalR.joinRequestOffersGroup(requestId);
        }

        if (isActive) setConnected(true);
      };

      connectSignalR();

      return () => {
        isActive = false;
        Object.entries(handlers).forEach(([event, handler]) => {
          serviceOfferSignalR.off(event as any, handler);
        });
        setConnected(false);
      };
    }, [providerId, requestId, dispatch, role, router]) // Depend only on stable values
  );

  return { connected };
};
