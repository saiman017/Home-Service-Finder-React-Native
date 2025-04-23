// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store/store";
// import { getProviderOffers } from "@/store/slice/serviceOffer";
// import { getServiceRequestById } from "@/store/slice/serviceRequest"; // Import the new thunk
// import Header from "@/components/Header";
// import { router } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { formatToNepalTime } from "@/utils/formattoNepalTime";

// // Interface for service offer
// interface ServiceOffer {
//   id: string;
//   serviceRequestId: string;
//   serviceProviderId: string;
//   providerName?: string;
//   offeredPrice: number;
//   sentAt: string;
//   expiresAt: string;
//   status: string;
// }

// export default function ProviderOffersList() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { userId } = useSelector((state: RootState) => state.auth);
//   const { offers, isLoading } = useSelector(
//     (state: RootState) => state.serviceOffer
//   );
//   const [refreshing, setRefreshing] = useState(false);
//   const [requestDetailsMap, setRequestDetailsMap] = useState<
//     Record<string, any>
//   >({}); // Local state to store request details by ID

//   // Load provider's offers on component mount
//   useEffect(() => {
//     if (userId) {
//       loadOffers();
//     }
//   }, [userId]);

//   const loadOffers = async () => {
//     if (userId) {
//       await dispatch(getProviderOffers(userId));
//     }
//   };

//   // Fetch service request details for all offers
//   useEffect(() => {
//     const fetchRequestDetails = async () => {
//       if (offers && offers.length > 0) {
//         const newRequestDetailsMap: Record<string, any> = {};
//         for (const offer of offers) {
//           try {
//             const response = await dispatch(
//               getServiceRequestById(offer.serviceRequestId)
//             ).unwrap();
//             newRequestDetailsMap[offer.serviceRequestId] = response;
//           } catch (error) {
//             console.error(
//               `Failed to fetch details for service request ID: ${offer.serviceRequestId}`,
//               error
//             );
//           }
//         }
//         setRequestDetailsMap(newRequestDetailsMap); // Update local state with fetched details
//       }
//     };

//     fetchRequestDetails();
//   }, [offers]); // Trigger when offers change

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadOffers();
//     setRefreshing(false);
//   };

//   const handleViewDetails = (serviceRequestId: string, offerId: string) => {
//     router.push({
//       pathname: "/(serviceProvider)/offerDetails",
//       params: { serviceRequestId, offerId },
//     });
//   };

//   const getStatusStyle = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "accepted":
//         return styles.statusAccepted;
//       case "rejected":
//         return styles.statusRejected;
//       case "expired":
//         return styles.statusExpired;
//       default:
//         return styles.statusPending;
//     }
//   };

//   const getStatusTextStyle = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "accepted":
//         return styles.statusTextAccepted;
//       case "rejected":
//         return styles.statusTextRejected;
//       case "expired":
//         return styles.statusTextExpired;
//       default:
//         return styles.statusTextPending;
//     }
//   };

//   const renderOfferItem = ({ item }: { item: ServiceOffer }) => {
//     const requestDetails = requestDetailsMap[item.serviceRequestId]; // Get details from local state
//     console.log(item.serviceRequestId);

//     return (
//       <View style={styles.offerCard}>
//         <View style={styles.offerHeader}>
//           <Text style={styles.offerTitle}>
//             {requestDetails?.serviceCategoryName || "Service Request"}
//           </Text>
//           <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
//             <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
//               {item.status}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.offerDetails}>
//           <View style={styles.detailRow}>
//             <Ionicons name="location-outline" size={16} color="#666" />
//             <Text style={styles.detailText}>
//               {requestDetails?.locationAddress || "Location not specified"}
//             </Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Ionicons name="cash-outline" size={16} color="#666" />
//             <Text style={styles.detailText}>
//               NPR {item.offeredPrice.toFixed(2)}
//             </Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Ionicons name="time-outline" size={16} color="#666" />
//             <Text style={styles.detailText}>
//               Sent: {formatToNepalTime(item.sentAt)}
//             </Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={styles.viewButton}
//           onPress={() => handleViewDetails(item.serviceRequestId, item.id)}
//         >
//           <Text style={styles.viewButtonText}>View Details</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Header title="My Service Offers" showBackButton={true} />

//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#3F63C7" />
//         </View>
//       ) : offers && offers.length > 0 ? (
//         <FlatList
//           data={offers}
//           renderItem={renderOfferItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.offersList}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListHeaderComponent={
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionHeaderText}>Your Sent Offers</Text>
//             </View>
//           }
//         />
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="document-outline" size={60} color="#999" />
//           <Text style={styles.emptyText}>
//             You haven't sent any service offers yet
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getProviderOffers } from "@/store/slice/serviceOffer";
import { getServiceRequestById } from "@/store/slice/serviceRequest";
import Header from "@/components/Header";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatToNepalTime } from "@/utils/formattoNepalTime";
import { useServiceOfferSignalR } from "@/hooks/useServiceOfferSignalR";

interface ServiceOffer {
  id: string;
  serviceRequestId: string;
  serviceProviderId: string;
  providerName?: string;
  offeredPrice: number;
  sentAt: string;
  expiresAt: string;
  status: string;
}

export default function ProviderOffersList() {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useSelector((state: RootState) => state.auth);
  const { offers, isLoading } = useSelector(
    (state: RootState) => state.serviceOffer
  );
  const [requestDetailsMap, setRequestDetailsMap] = useState<
    Record<string, any>
  >({});

  const { connected } = useServiceOfferSignalR(userId);

  useEffect(() => {
    if (userId) {
      dispatch(getProviderOffers(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (offers && offers.length > 0) {
        const newMap: Record<string, any> = {};
        for (const offer of offers) {
          try {
            const response = await dispatch(
              getServiceRequestById(offer.serviceRequestId)
            ).unwrap();
            newMap[offer.serviceRequestId] = response;
          } catch (error) {
            console.error(
              `Failed to load request for ${offer.serviceRequestId}`
            );
          }
        }
        setRequestDetailsMap(newMap);
      }
    };

    fetchRequestDetails();
  }, [offers]);

  const handleViewDetails = (serviceRequestId: string, offerId: string) => {
    router.push({
      pathname: "/(serviceProvider)/offerDetails",
      params: { serviceRequestId, offerId },
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return styles.statusAccepted;
      case "rejected":
        return styles.statusRejected;
      case "expired":
        return styles.statusExpired;
      default:
        return styles.statusPending;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return styles.statusTextAccepted;
      case "rejected":
        return styles.statusTextRejected;
      case "expired":
        return styles.statusTextExpired;
      default:
        return styles.statusTextPending;
    }
  };

  const renderOfferItem = ({ item }: { item: ServiceOffer }) => {
    const requestDetails = requestDetailsMap[item.serviceRequestId];

    return (
      <View style={styles.offerCard}>
        <View style={styles.offerHeader}>
          <Text style={styles.offerTitle}>
            {requestDetails?.serviceCategoryName || "Service Request"}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.offerDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {requestDetails?.locationAddress || "Location not specified"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              NPR {item.offeredPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Sent: {formatToNepalTime(item.sentAt)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewDetails(item.serviceRequestId, item.id)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="My Service Offers" showBackButton={true} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3F63C7" />
        </View>
      ) : offers && offers.length > 0 ? (
        <FlatList
          data={offers}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.offersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color="#999" />
          <Text style={styles.emptyText}>
            You haven't sent any service offers yet
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  offersList: {
    padding: 15,
  },
  offerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: "#FFF9C4",
  },
  statusAccepted: {
    backgroundColor: "#E8F5E9",
  },
  statusRejected: {
    backgroundColor: "#FFEBEE",
  },
  statusExpired: {
    backgroundColor: "#ECEFF1",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextPending: {
    color: "#F57F17",
  },
  statusTextAccepted: {
    color: "#2E7D32",
  },
  statusTextRejected: {
    color: "#C62828",
  },
  statusTextExpired: {
    color: "#546E7A",
  },
  offerDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: "#3F63C7",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewButtonText: {
    fontWeight: "600",
    color: "#ffffff",
  },
});
