import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

// Type definitions for API responses and data structures
interface ServiceProvider {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  role: string;
  profilePicture?: string;
  experience: number;
  personalDescription?: string;
  isAdminVerified: boolean;
  isEmailVerified: boolean;
  serviceCategory: string;
  serviceCategoryId: string;

  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

interface ProviderStatistics {
  totalEarnings: number;
  totalCompletedOffers: number;
  totalRevenueToday: number;
  totalRevenueThisWeek: number;
  totalOffersCompletedToday: number;
}

interface ServiceProviderState {
  providers: ServiceProvider[];
  selectedProvider: ServiceProvider | null;
  statistics: ProviderStatistics | null;
  isLoading: boolean;
  error: string | null;
}

interface APIResponse {
  success: boolean;
  code: number;
  message: string;
  data: any;
}

// Request DTOs that match the backend
interface ServiceProviderRequestDto {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  roleId: string;
  password: string;
  confirmPassword: string;
  profilePicture?: string;
  experience: number;
  personalDescription?: string;
  serviceCategoryId: string;
}

interface ServiceProviderUpdateRequestDto {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  profilePicture?: string;
  experience: number;
  personalDescription?: string;
}

// Initial state
const initialState: ServiceProviderState = {
  providers: [],
  selectedProvider: null,
  statistics: null,

  isLoading: false,
  error: null,
};

// Async thunks for API interactions
export const fetchAllServiceProviders = createAsyncThunk(
  "serviceProvider/fetchAll",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get("/serviceProvider");
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.message || "Failed to fetch service providers";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch service providers";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchServiceProviderById = createAsyncThunk(
  "serviceProvider/fetchById",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(`/serviceProvider/${id}`);
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.message || "Failed to fetch service provider details";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to fetch service provider details";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const registerServiceProvider = createAsyncThunk(
  "serviceProvider/register",
  async (
    providerData: ServiceProviderRequestDto,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await getAxiosInstance().post(
        "/serviceProvider",
        providerData
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage = response.data.message || "Registration failed";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      dispatch(setMessage({ data: "Registration successful!" }));
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const updateServiceProvider = createAsyncThunk(
  "serviceProvider/update",
  async (
    {
      id,
      updateData,
    }: { id: string; updateData: ServiceProviderUpdateRequestDto },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await getAxiosInstance().put(
        `/serviceProvider/${id}`,
        updateData
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage = response.data.message || "Update failed";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      dispatch(setMessage({ data: "Profile updated successfully!" }));
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Update failed";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const deleteServiceProvider = createAsyncThunk(
  "serviceProvider/delete",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().delete(
        `/serviceProvider/${id}`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage = response.data.message || "Delete failed";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      dispatch(setMessage({ data: "Account deleted successfully!" }));
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || "Delete failed";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchProviderStatistics = createAsyncThunk(
  "serviceProvider/fetchStatistics",
  async (providerId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceProvider/statistics/${providerId}`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.message || "Failed to fetch statistics";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch statistics";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Create the slice
const serviceProviderSlice = createSlice({
  name: "serviceProvider",
  initialState,
  reducers: {
    resetServiceProviderState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    clearSelectedProvider: (state) => {
      state.selectedProvider = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all providers
      .addCase(fetchAllServiceProviders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllServiceProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload;
      })
      .addCase(fetchAllServiceProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch provider by ID
      .addCase(fetchServiceProviderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceProviderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProvider = action.payload;
      })
      .addCase(fetchServiceProviderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register provider
      .addCase(registerServiceProvider.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerServiceProvider.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally add the new provider to the list if needed
        // state.providers.push(action.payload);
      })
      .addCase(registerServiceProvider.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update provider
      .addCase(updateServiceProvider.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateServiceProvider.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProvider = action.payload;
        // Update in the providers array if present
        const index = state.providers.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.providers[index] = action.payload;
        }
      })
      .addCase(updateServiceProvider.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete provider
      .addCase(deleteServiceProvider.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteServiceProvider.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = state.providers.filter(
          (p) => p.id !== action.payload
        );
        if (state.selectedProvider?.id === action.payload) {
          state.selectedProvider = null;
        }
      })
      .addCase(deleteServiceProvider.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchProviderStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProviderStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchProviderStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { resetServiceProviderState, clearSelectedProvider } =
  serviceProviderSlice.actions;
export default serviceProviderSlice.reducer;
