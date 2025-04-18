// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   TextInput,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState, AppDispatch } from "@/store/store";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import LocationMap from "@/components/LocationMap";
// import Header from "@/components/Header";
// import {
//   setCurrentLocation,
//   fetchAddressSuggestions,
//   clearSuggestions,
//   saveLocationToBackend,
// } from "@/store/slice/location";

// enum LocationViewMode {
//   LIST,
//   MAP,
// }

// interface LocationItem {
//   userId?: string;
//   address: string;
//   city: string;
//   postalCode: string;
//   latitude: number;
//   longitude: number;
// }

// export default function LocationSelectScreen() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { currentLocation, recentLocations, isLoading, suggestions, error } =
//     useSelector((state: RootState) => state.location);
//   const [viewMode, setViewMode] = useState<LocationViewMode>(
//     LocationViewMode.LIST
//   );
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
//     null
//   );
//   const { userId } = useSelector((state: RootState) => state.auth);

//   const handleSearchChange = useCallback(
//     (text: string) => {
//       setSearchQuery(text);
//       if (debounceTimer) {
//         clearTimeout(debounceTimer);
//       }
//       if (text.length > 2) {
//         const timer = setTimeout(() => {
//           dispatch(fetchAddressSuggestions(text));
//         }, 500);
//         setDebounceTimer(timer);
//       } else {
//         dispatch(clearSuggestions());
//       }
//     },
//     [debounceTimer, dispatch]
//   );

//   useEffect(() => {
//     return () => {
//       if (debounceTimer) {
//         clearTimeout(debounceTimer);
//       }
//     };
//   }, [debounceTimer]);

//   // Show error alert if there's an error
//   useEffect(() => {
//     if (error) {
//       Alert.alert("Error", error, [{ text: "OK" }]);
//     }
//   }, [error]);

//   const handleLocationSelect = useCallback(
//     async (location: LocationItem) => {
//       try {
//         // First update the local state with the selected location
//         dispatch(setCurrentLocation(location));

//         if (!userId) {
//           Alert.alert("Error", "User ID is missing. Please log in again.");
//           return;
//         }

//         // Create a new location object with only the properties we need
//         const locationToSave = {
//           userId, // Use the authenticated user's ID from auth state
//           address: location.address,
//           city: location.city || "",
//           postalCode: location.postalCode || "",
//           latitude: location.latitude,
//           longitude: location.longitude,
//         };

//         const saveResult = await dispatch(
//           saveLocationToBackend(locationToSave)
//         ).unwrap();

//         console.log("Location saved successfully:", saveResult);
//         router.back();
//       } catch (err: any) {
//         console.error("Failed to save location:", err);
//         Alert.alert(
//           "Error",
//           `Failed to save location: ${err.message || "Unknown error"}`,
//           [{ text: "OK" }]
//         );
//       }
//     },
//     [dispatch, userId]
//   );

//   const handleSetOnMap = useCallback(() => {
//     setViewMode(LocationViewMode.MAP);
//   }, []);

//   const renderLocationItem = useCallback(
//     ({
//       item,
//       isRecent = false,
//     }: {
//       item: LocationItem;
//       isRecent?: boolean;
//     }) => (
//       <TouchableOpacity
//         style={styles.locationItem}
//         onPress={() => handleLocationSelect(item)}
//       >
//         <Ionicons
//           name={isRecent ? "time-outline" : "location-outline"}
//           size={20}
//           color="#666"
//         />
//         <View style={styles.locationDetails}>
//           <Text style={styles.locationName} numberOfLines={1}>
//             {item.address}
//           </Text>
//           {item.city && <Text style={styles.locationSubtext}>{item.city}</Text>}
//         </View>
//       </TouchableOpacity>
//     ),
//     [handleLocationSelect]
//   );

//   if (viewMode === LocationViewMode.MAP) {
//     return (
//       <LocationMap
//         onLocationSelect={handleLocationSelect}
//         initialRegion={
//           currentLocation
//             ? {
//                 latitude: currentLocation.latitude,
//                 longitude: currentLocation.longitude,
//                 latitudeDelta: 0.005,
//                 longitudeDelta: 0.005,
//               }
//             : undefined
//         }
//       />
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Header title="Set Address" showBackButton={true} />

//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={18} color="#666" />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search for an area, street name..."
//           value={searchQuery}
//           onChangeText={handleSearchChange}
//           autoFocus={true}
//         />
//         {searchQuery.length > 0 && (
//           <TouchableOpacity onPress={() => setSearchQuery("")}>
//             <Ionicons name="close-circle" size={18} color="#666" />
//           </TouchableOpacity>
//         )}
//       </View>

//       {isLoading && (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="small" color="#F8C52B" />
//         </View>
//       )}

//       {searchQuery.length > 2 ? (
//         suggestions.length > 0 ? (
//           <FlatList
//             data={suggestions}
//             keyExtractor={(item) =>
//               item.userId?.toString() || `${item.latitude}-${item.longitude}`
//             }
//             renderItem={({ item }) => renderLocationItem({ item })}
//             ListHeaderComponent={
//               <Text style={styles.sectionTitle}>Search Results</Text>
//             }
//           />
//         ) : (
//           <View style={styles.noResultsContainer}>
//             <Text style={styles.noResultsText}>No locations found</Text>
//             <Text style={styles.noResultsSubtext}>
//               Try a different search or set location on map
//             </Text>
//           </View>
//         )
//       ) : recentLocations.length > 0 ? (
//         <FlatList
//           data={recentLocations}
//           keyExtractor={(item, index) => item.userId || index.toString()}
//           renderItem={({ item }) =>
//             renderLocationItem({ item, isRecent: true })
//           }
//           ListHeaderComponent={
//             <Text style={styles.sectionTitle}>Recent Locations</Text>
//           }
//         />
//       ) : null}

//       <TouchableOpacity style={styles.mapOptionButton} onPress={handleSetOnMap}>
//         <Ionicons name="map-outline" size={20} color="#333" />
//         <Text style={styles.optionText}>Set on Map</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import LocationMap from "@/components/LocationMap";
import Header from "@/components/Header";
import {
  setCurrentLocation,
  fetchAddressSuggestions,
  clearSuggestions,
  saveLocationToBackend,
} from "@/store/slice/location";

enum LocationViewMode {
  LIST,
  MAP,
}

interface LocationItem {
  userId?: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export default function LocationSelectScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation, recentLocations, isLoading, suggestions, error } =
    useSelector((state: RootState) => state.location);
  const [viewMode, setViewMode] = useState<LocationViewMode>(
    LocationViewMode.LIST
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const { userId } = useSelector((state: RootState) => state.auth);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (text.length > 2) {
        const timer = setTimeout(() => {
          dispatch(fetchAddressSuggestions(text));
        }, 500);
        setDebounceTimer(timer);
      } else {
        dispatch(clearSuggestions());
      }
    },
    [debounceTimer, dispatch]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Show error alert if there's an error
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK" }]);
    }
  }, [error]);

  const handleLocationSelect = useCallback(
    async (location: LocationItem) => {
      try {
        console.log("Selected location:", location);

        // First update the local state with the selected location
        dispatch(setCurrentLocation(location));

        if (!userId) {
          Alert.alert("Error", "User ID is missing. Please log in again.");
          return;
        }

        // Create a new location object with only the properties we need
        const locationToSave = {
          userId, // Use the authenticated user's ID from auth state
          address: location.address,
          city: location.city || "",
          postalCode: location.postalCode || "",
          latitude: location.latitude,
          longitude: location.longitude,
        };

        const saveResult = await dispatch(
          saveLocationToBackend(locationToSave)
        ).unwrap();

        console.log("Location saved successfully:", saveResult);
        router.back();
      } catch (err: any) {
        console.error("Failed to save location:", err);
        Alert.alert(
          "Error",
          `Failed to save location: ${err.message || "Unknown error"}`,
          [{ text: "OK" }]
        );
      }
    },
    [dispatch, userId]
  );

  const handleSetOnMap = useCallback(() => {
    setViewMode(LocationViewMode.MAP);
  }, []);

  const renderLocationItem = useCallback(
    ({
      item,
      isRecent = false,
    }: {
      item: LocationItem;
      isRecent?: boolean;
    }) => (
      <TouchableOpacity
        style={styles.locationItem}
        onPress={() => handleLocationSelect(item)}
      >
        <Ionicons
          name={isRecent ? "time-outline" : "location-outline"}
          size={20}
          color="#666"
        />
        <View style={styles.locationDetails}>
          <Text style={styles.locationName} numberOfLines={1}>
            {item.address}
          </Text>
          {item.city && <Text style={styles.locationSubtext}>{item.city}</Text>}
        </View>
      </TouchableOpacity>
    ),
    [handleLocationSelect]
  );

  if (viewMode === LocationViewMode.MAP) {
    return (
      <LocationMap
        onLocationSelect={handleLocationSelect}
        initialRegion={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }
            : undefined
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Set Address" showBackButton={true} />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for an area, street name..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus={true}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F8C52B" />
        </View>
      )}

      {searchQuery.length > 2 ? (
        suggestions.length > 0 ? (
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) =>
              item.userId?.toString() ||
              `${item.latitude}-${item.longitude}-${index}`
            }
            renderItem={({ item }) => renderLocationItem({ item })}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Search Results</Text>
            }
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No locations found</Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search or set location on map
            </Text>
          </View>
        )
      ) : recentLocations.length > 0 ? (
        <FlatList
          data={recentLocations}
          keyExtractor={(item, index) => item.userId || index.toString()}
          renderItem={({ item }) =>
            renderLocationItem({ item, isRecent: true })
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Recent Locations</Text>
          }
        />
      ) : null}

      <TouchableOpacity style={styles.mapOptionButton} onPress={handleSetOnMap}>
        <Ionicons name="map-outline" size={20} color="#333" />
        <Text style={styles.optionText}>Set on Map</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    height: 40,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsContainer: {
    padding: 30,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "500",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  locationItem: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  locationSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  mapOptionButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
  },
});
