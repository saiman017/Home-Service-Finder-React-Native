// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
// interface ServiceOffer {
//   id: string;
//   providerName?: string;
//   offeredPrice: number;
//   // ... other properties
// }

// interface OfferNotificationProps {
//   serviceOfferData: ServiceOffer;
//   onAccept: (offerId: string) => void;
//   onDecline: (offerId: string) => void;
// }
// const PANEL_MIN_HEIGHT = 80;

// const OfferNotification: React.FC<OfferNotificationProps> = ({
//   serviceOfferData,
//   onAccept,
//   onDecline,
// }) => {
//   const { id, providerName, offeredPrice } = serviceOfferData;

//   return (
//     <View style={styles.container}>
//       <View style={styles.notificationCard}>
//         {/* Provider Basic Info */}
//         <View style={styles.providerInfo}>
//           <View style={styles.profileImageContainer}>
//             <Image
//               source={require("@/assets/images/electrician.png")}
//               style={styles.profileImage}
//             />
//           </View>
//           <Text style={styles.providerName}>{providerName}</Text>
//         </View>

//         {/* Offered Price */}
//         <View style={styles.priceContainer}>
//           <Text style={styles.currencySymbol}>₹</Text>
//           <Text style={styles.price}>{offeredPrice}</Text>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.actionButtonsContainer}>
//           <TouchableOpacity
//             style={styles.declineButton}
//             onPress={() => onDecline(id)}
//           >
//             <Text style={styles.declineText}>Decline</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.acceptButton}
//             onPress={() => onAccept(id)}
//           >
//             <Text style={styles.acceptText}>Accept</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     bottom: PANEL_MIN_HEIGHT + 600,
//     left: 16,
//     right: 16,
//     zIndex: 100,
//   },
//   notificationCard: {
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   providerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   profileImageContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#f0f0f0",
//     overflow: "hidden",
//     marginRight: 10,
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//   },
//   providerName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   priceContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   currencySymbol: {
//     fontSize: 18,
//     fontWeight: "500",
//     color: "#333",
//     marginRight: 2,
//   },
//   price: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#333",
//   },
//   actionButtonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   declineButton: {
//     flex: 1,
//     height: 44,
//     backgroundColor: "#f5f5f5",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 8,
//     marginRight: 8,
//   },
//   declineText: {
//     color: "#666",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   acceptButton: {
//     flex: 1,
//     height: 44,
//     backgroundColor: "#3F63C7",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 8,
//     marginLeft: 8,
//   },
//   acceptText: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// export default OfferNotification;
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useDispatch } from "react-redux";
import { router } from "expo-router";
import {
  resetServiceRequestState,
  clearServiceRequestData,
} from "@/store/slice/serviceRequest";
import { AppDispatch } from "@/store/store";

interface ServiceOffer {
  id: string;
  providerName?: string;
  offeredPrice: number;
  status: string;
  // ... other properties
}

interface OfferNotificationProps {
  serviceOfferData: ServiceOffer;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
}

const PANEL_MIN_HEIGHT = 80;

const OfferNotification: React.FC<OfferNotificationProps> = ({
  serviceOfferData,
  onAccept,
  onDecline,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isVisible, setIsVisible] = useState(true);
  const { id, providerName, offeredPrice } = serviceOfferData;

  if (!isVisible || serviceOfferData.status !== "Pending") {
    return null;
  }

  const handleAccept = () => {
    setIsVisible(false);
    onAccept(id);
    // Navigate to home page after accepting
    setTimeout(() => {
      dispatch(resetServiceRequestState());
      dispatch(clearServiceRequestData());
      router.replace("/(tabs)/home");
    }, 1000);
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.notificationCard}>
        {/* Provider Basic Info */}
        <View style={styles.providerInfo}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require("@/assets/images/electrician.png")}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.providerName}>{providerName}</Text>
        </View>

        <View>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>NPR</Text>
            <Text style={styles.price}>{offeredPrice}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>NPR</Text>
            <Text style={styles.price}>{offeredPrice}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDecline}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: PANEL_MIN_HEIGHT + 600,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  notificationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginRight: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  declineButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 8,
  },
  declineText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  acceptButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#3F63C7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OfferNotification;
