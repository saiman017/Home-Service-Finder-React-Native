// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { getAxiosInstance } from "@/axios/axiosinstance";
// import Constants from "expo-constants";
// // Define your Google Maps API key
// const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;
// // Location type
// export interface Location {
//   userId?: string;
//   address: string;
//   city: string;
//   postalCode: string;
//   latitude: number;
//   longitude: number;
// }

// // State
// interface LocationState {
//   isLoading: boolean;
//   error: string | null;
//   currentLocation: Location | null;
//   recentLocations: Location[];
//   suggestions: Location[];
// }

// const initialState: LocationState = {
//   isLoading: false,
//   error: null,
//   currentLocation: null,
//   recentLocations: [],
//   suggestions: [],
// };

// // Thunks
// export const fetchAddressSuggestions = createAsyncThunk(
//   "location/fetchSuggestions",
//   async (query: string, { rejectWithValue }) => {
//     try {
//       const axios = getAxiosInstance();
//       // Use Google Places Autocomplete API for address suggestions
//       const res = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
//         {
//           params: {
//             input: query,
//             key: GOOGLE_MAPS_API_KEY,
//             types: "address",
//           },
//         }
//       );

//       if (!res.data.predictions || res.data.status !== "OK") {
//         throw new Error(
//           res.data.error_message || "Failed to fetch suggestions"
//         );
//       }

//       // For each prediction, get place details to get coordinates
//       const placesDetailsPromises = res.data.predictions.map(
//         async (prediction: any) => {
//           const detailsRes = await axios.get(
//             `https://maps.googleapis.com/maps/api/place/details/json`,
//             {
//               params: {
//                 place_id: prediction.place_id,
//                 fields: "geometry,address_component,formatted_address",
//                 key: GOOGLE_MAPS_API_KEY,
//               },
//             }
//           );

//           if (
//             !detailsRes.data.result ||
//             detailsRes.data.status !== "OK" ||
//             !detailsRes.data.result.geometry
//           ) {
//             return null;
//           }

//           const result = detailsRes.data.result;
//           const addressComponents = result.address_components || [];

//           // Extract city and postal code from address components
//           let city = "";
//           let postalCode = "";

//           addressComponents.forEach((component: any) => {
//             if (
//               component.types.includes("locality") ||
//               component.types.includes("administrative_area_level_2")
//             ) {
//               city = component.long_name;
//             }
//             if (component.types.includes("postal_code")) {
//               postalCode = component.long_name;
//             }
//           });

//           return {
//             address: result.formatted_address,
//             latitude: result.geometry.location.lat,
//             longitude: result.geometry.location.lng,
//             city,
//             postalCode,
//           };
//         }
//       );

//       const placesDetails = await Promise.all(placesDetailsPromises);
//       return placesDetails.filter((place) => place !== null);
//     } catch (error: any) {
//       console.error("Error fetching address suggestions:", error);
//       return rejectWithValue(
//         error.message || "Failed to fetch address suggestions"
//       );
//     }
//   }
// );

// export const reverseGeocode = createAsyncThunk(
//   "location/reverseGeocode",
//   async (
//     { latitude, longitude }: { latitude: number; longitude: number },
//     { rejectWithValue }
//   ) => {
//     try {
//       const axios = getAxiosInstance();
//       const res = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json`,
//         {
//           params: {
//             latlng: `${latitude},${longitude}`,
//             key: GOOGLE_MAPS_API_KEY,
//           },
//         }
//       );

//       if (!res.data.results || res.data.status !== "OK") {
//         throw new Error(res.data.error_message || "Failed to reverse geocode");
//       }

//       const result = res.data.results[0];
//       const addressComponents = result.address_components || [];

//       // Extract city and postal code from address components
//       let city = "";
//       let postalCode = "";

//       addressComponents.forEach((component: any) => {
//         if (
//           component.types.includes("locality") ||
//           component.types.includes("administrative_area_level_2")
//         ) {
//           city = component.long_name;
//         }
//         if (component.types.includes("postal_code")) {
//           postalCode = component.long_name;
//         }
//       });

//       return {
//         address: result.formatted_address,
//         city,
//         postalCode,
//       };
//     } catch (error: any) {
//       console.error("Error in reverse geocoding:", error);
//       return rejectWithValue(error.message || "Failed to reverse geocode");
//     }
//   }
// );

// export const saveLocationToBackend = createAsyncThunk(
//   "location/saveToBackend",
//   async (
//     locationData: {
//       userId: string;
//       address: string;
//       city: string;
//       postalCode: string;
//       latitude: number;
//       longitude: number;
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       // Validate userId
//       if (!locationData.userId) {
//         throw new Error("User ID is required");
//       }

//       // Format the request payload
//       const payload = {
//         address: locationData.address,
//         city: locationData.city || "",
//         postalCode: locationData.postalCode || "",
//         latitude: locationData.latitude,
//         longitude: locationData.longitude,
//       };

//       console.log("Saving location for user:", locationData.userId);
//       console.log("Location payload:", payload);

//       const axios = getAxiosInstance();
//       // Using PUT instead of POST
//       const res = await axios.put(`/location/${locationData.userId}`, payload);

//       console.log("Location save response:", res.data);

//       if (!res.data.success) {
//         throw new Error(res.data.message || "Error saving location");
//       }
//       return res.data.data;
//     } catch (error: any) {
//       console.error("Error saving location:", error);
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const fetchLocation = createAsyncThunk(
//   "location/fetchLocation",
//   async (userId: string, { rejectWithValue }) => {
//     try {
//       if (!userId) {
//         throw new Error("User ID is required");
//       }

//       console.log("Fetching location for user:", userId);

//       const axios = getAxiosInstance();
//       const res = await axios.get(`/location/${userId}`);

//       console.log("Location fetch response:", res.data);

//       if (!res.data.success) {
//         throw new Error(res.data.message || "Error fetching location");
//       }

//       return res.data.data;
//     } catch (error: any) {
//       console.error("Error fetching location:", error);
//       return rejectWithValue(
//         error.response?.data?.message || "Failed to fetch location"
//       );
//     }
//   }
// );

// // Slice
// const locationSlice = createSlice({
//   name: "location",
//   initialState,
//   reducers: {
//     setCurrentLocation(state, action: PayloadAction<Location>) {
//       const newLocation = action.payload;
//       state.currentLocation = newLocation;

//       // Check if location already exists in recent locations
//       const exists = state.recentLocations.some(
//         (loc) =>
//           loc.latitude === newLocation.latitude &&
//           loc.longitude === newLocation.longitude
//       );

//       if (!exists) {
//         state.recentLocations.unshift(newLocation);
//         // Keep only the 5 most recent locations
//         if (state.recentLocations.length > 5) {
//           state.recentLocations = state.recentLocations.slice(0, 5);
//         }
//       }
//     },
//     clearCurrentLocation(state) {
//       state.currentLocation = null;
//     },
//     clearSuggestions(state) {
//       state.suggestions = [];
//     },
//     resetLocationState() {
//       return initialState;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch suggestions
//       .addCase(fetchAddressSuggestions.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAddressSuggestions.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.suggestions = action.payload;
//       })
//       .addCase(fetchAddressSuggestions.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })

//       // Reverse geocode
//       .addCase(reverseGeocode.fulfilled, (state, action) => {
//         if (state.currentLocation) {
//           state.currentLocation = {
//             ...state.currentLocation,
//             ...action.payload,
//           };
//         }
//       })

//       // Save location
//       .addCase(saveLocationToBackend.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(saveLocationToBackend.fulfilled, (state, action) => {
//         state.isLoading = false;
//         if (state.currentLocation && action.payload) {
//           state.currentLocation.userId = action.payload.id;
//         }
//       })
//       .addCase(saveLocationToBackend.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })

//       // Fetch location
//       .addCase(fetchLocation.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchLocation.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.currentLocation = action.payload;
//       })
//       .addCase(fetchLocation.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const {
//   setCurrentLocation,
//   clearCurrentLocation,
//   clearSuggestions,
//   resetLocationState,
// } = locationSlice.actions;

// export default locationSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { googleMapsService, LocationData } from "./googleMapsService";

// Location type
export interface Location {
  userId?: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

// State
interface LocationState {
  isLoading: boolean;
  error: string | null;
  currentLocation: Location | null;
  recentLocations: Location[];
  suggestions: Location[];
}

const initialState: LocationState = {
  isLoading: false,
  error: null,
  currentLocation: null,
  recentLocations: [],
  suggestions: [],
};

// Thunks
export const fetchAddressSuggestions = createAsyncThunk(
  "location/fetchSuggestions",
  async (query: string, { rejectWithValue }) => {
    try {
      return await googleMapsService.fetchAddressSuggestions(query);
    } catch (error: any) {
      console.error("Error fetching address suggestions:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const reverseGeocode = createAsyncThunk(
  "location/reverseGeocode",
  async (
    { latitude, longitude }: { latitude: number; longitude: number },
    { rejectWithValue }
  ) => {
    try {
      return await googleMapsService.reverseGeocode(latitude, longitude);
    } catch (error: any) {
      console.error("Error in reverse geocoding:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const saveLocationToBackend = createAsyncThunk(
  "location/saveToBackend",
  async (
    locationData: {
      userId: string;
      address: string;
      city: string;
      postalCode: string;
      latitude: number;
      longitude: number;
    },
    { rejectWithValue }
  ) => {
    try {
      // Validate userId
      if (!locationData.userId) {
        throw new Error("User ID is required");
      }

      // Format the request payload
      const payload = {
        address: locationData.address,
        city: locationData.city || "",
        postalCode: locationData.postalCode || "",
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };

      console.log("Saving location for user:", locationData.userId);
      console.log("Location payload:", payload);

      const axios = getAxiosInstance();
      // Using PUT instead of POST
      const res = await axios.put(`/location/${locationData.userId}`, payload);

      console.log("Location save response:", res.data);

      if (!res.data.success) {
        throw new Error(res.data.message || "Error saving location");
      }
      return res.data.data;
    } catch (error: any) {
      console.error("Error saving location:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchLocation = createAsyncThunk(
  "location/fetchLocation",
  async (userId: string, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      console.log("Fetching location for user:", userId);

      const axios = getAxiosInstance();
      const res = await axios.get(`/location/${userId}`);

      console.log("Location fetch response:", res.data);

      if (!res.data.success) {
        throw new Error(res.data.message || "Error fetching location");
      }

      return res.data.data;
    } catch (error: any) {
      console.error("Error fetching location:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch location"
      );
    }
  }
);

// Slice
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setCurrentLocation(state, action: PayloadAction<Location>) {
      const newLocation = action.payload;
      state.currentLocation = newLocation;

      // Check if location already exists in recent locations
      const exists = state.recentLocations.some(
        (loc) =>
          loc.latitude === newLocation.latitude &&
          loc.longitude === newLocation.longitude
      );

      if (!exists) {
        state.recentLocations.unshift(newLocation);
        // Keep only the 5 most recent locations
        if (state.recentLocations.length > 5) {
          state.recentLocations = state.recentLocations.slice(0, 5);
        }
      }
    },
    clearCurrentLocation(state) {
      state.currentLocation = null;
    },
    clearSuggestions(state) {
      state.suggestions = [];
    },
    resetLocationState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suggestions
      .addCase(fetchAddressSuggestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddressSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchAddressSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reverse geocode
      .addCase(reverseGeocode.fulfilled, (state, action) => {
        if (state.currentLocation) {
          state.currentLocation = {
            ...state.currentLocation,
            ...action.payload,
          };
        }
      })

      // Save location
      .addCase(saveLocationToBackend.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveLocationToBackend.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentLocation && action.payload) {
          state.currentLocation.userId = action.payload.id;
        }
      })
      .addCase(saveLocationToBackend.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch location
      .addCase(fetchLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLocation = action.payload;
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentLocation,
  clearCurrentLocation,
  clearSuggestions,
  resetLocationState,
} = locationSlice.actions;

export default locationSlice.reducer;
