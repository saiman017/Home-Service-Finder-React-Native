// serviceListSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

// Service List type definitions
interface ServiceList {
  id: string;
  name: string;
  serviceCategoryId: string;
  createdAt: string;
  modifiedAt: string;
}

interface ServiceListState {
  services: ServiceList[];
  servicesByCategory: ServiceList[];
  selectedService: ServiceList | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ServiceListState = {
  services: [],
  servicesByCategory: [],
  selectedService: null,
  loading: false,
  error: null,
};

// Async thunk for fetching all services
export const fetchServiceLists = createAsyncThunk(
  "serviceList/fetchAll",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get("/serviceList");
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch services";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch services";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Async thunk for fetching a service by ID
export const fetchServiceListById = createAsyncThunk(
  "serviceList/fetchById",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(`/serviceList/${id}`);
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch service";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch service";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Async thunk for fetching services by category ID
export const fetchServiceListByCategory = createAsyncThunk(
  "serviceList/fetchByCategory",
  async (categoryId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceList/by-category/${categoryId}`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch services by category";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }
      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch services by category";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Create the service list slice
const serviceListSlice = createSlice({
  name: "serviceList",
  initialState,
  reducers: {
    resetServiceListState: (state) => {
      state.error = null;
      state.loading = false;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    clearServicesByCategory: (state) => {
      state.servicesByCategory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all services
      .addCase(fetchServiceLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceLists.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServiceLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch service by ID
      .addCase(fetchServiceListById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceListById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceListById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch services by category
      .addCase(fetchServiceListByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceListByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.servicesByCategory = action.payload;
      })
      .addCase(fetchServiceListByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  resetServiceListState,
  setSelectedService,
  clearSelectedService,
  clearServicesByCategory,
} = serviceListSlice.actions;

export default serviceListSlice.reducer;
