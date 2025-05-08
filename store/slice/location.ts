import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { googleMapsService, LocationData } from "./googleMapsService";

export interface Location {
  userId?: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

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
export const fetchAddressSuggestions = createAsyncThunk("location/fetchSuggestions", async (query: string, { rejectWithValue }) => {
  try {
    return await googleMapsService.fetchAddressSuggestions(query);
  } catch (error: any) {
    console.error("Error fetching address suggestions:", error);
    return rejectWithValue(error.message);
  }
});

export const reverseGeocode = createAsyncThunk("location/reverseGeocode", async ({ latitude, longitude }: { latitude: number; longitude: number }, { rejectWithValue }) => {
  try {
    return await googleMapsService.reverseGeocode(latitude, longitude);
  } catch (error: any) {
    console.error("Error in reverse geocoding:", error);
    return rejectWithValue(error.message);
  }
});

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

export const fetchLocation = createAsyncThunk("location/fetchLocation", async (userId: string, { rejectWithValue }) => {
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
    return rejectWithValue(error.response?.data?.message || "Failed to fetch location");
  }
});

// Slice
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setCurrentLocation(state, action: PayloadAction<Location>) {
      const newLocation = action.payload;
      state.currentLocation = newLocation;

      const exists = state.recentLocations.some((loc) => loc.latitude === newLocation.latitude && loc.longitude === newLocation.longitude);

      if (!exists) {
        state.recentLocations.unshift(newLocation);

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

export const { setCurrentLocation, clearCurrentLocation, clearSuggestions, resetLocationState } = locationSlice.actions;

export default locationSlice.reducer;
