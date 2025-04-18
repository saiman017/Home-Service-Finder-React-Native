// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { getAxiosInstance } from "@/axios/axiosinstance";
// import { setMessage } from "./message";

// // Define interfaces for the service request data
// interface ServiceRequestData {
//   customerId: string;
//   locationId: string;
//   serviceCategoryId: string;
//   description: string;
//   serviceListIds: string[];
// }

// interface ServiceRequestState {
//   isLoading: boolean;
//   error: string | null;
//   success: boolean;
//   serviceRequestId: string | null;
//   customerRequests: any[];
//   requestsByCategory: any[];
//   currentRequest: any | null;
// }

// // Initial state
// const initialState: ServiceRequestState = {
//   isLoading: false,
//   error: null,
//   success: false,
//   serviceRequestId: null,
//   customerRequests: [],
//   requestsByCategory: [],
//   currentRequest: null,
// };

// // Create service request thunk
// export const createServiceRequest = createAsyncThunk(
//   "serviceRequest/create",
//   async (requestData: ServiceRequestData, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await getAxiosInstance().post(
//         "/serviceRequest",
//         requestData
//       );
//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data ||
//           response.data.message ||
//           "Failed to create service request";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }

//       dispatch(setMessage({ data: "Service request created successfully!" }));
//       return response.data;
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to create service request";

//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

// // Get requests by customer ID
// export const getRequestsByCustomerId = createAsyncThunk(
//   "serviceRequest/getByCustomer",
//   async (customerId: string, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await getAxiosInstance().get(
//         `/service-requests/customer/${customerId}`
//       );
//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data ||
//           response.data.message ||
//           "Failed to fetch customer requests";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to fetch customer requests";

//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

// // Get requests by category ID
// export const getRequestsByCategory = createAsyncThunk(
//   "serviceRequest/getByCategory",
//   async (categoryId: string, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await getAxiosInstance().get(
//         `/service-requests/category/${categoryId}`
//       );
//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data ||
//           response.data.message ||
//           "Failed to fetch category requests";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to fetch category requests";

//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

// // Get service request by ID
// export const getServiceRequestById = createAsyncThunk(
//   "serviceRequest/getById",
//   async (requestId: string, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await getAxiosInstance().get(
//         `/service-requests/${requestId}`
//       );
//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data ||
//           response.data.message ||
//           "Failed to fetch service request";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }

//       return response.data.data;
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to fetch service request";

//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

// // Create the service request slice
// const serviceRequestSlice = createSlice({
//   name: "serviceRequest",
//   initialState,
//   reducers: {
//     resetServiceRequestState: (state) => {
//       state.isLoading = false;
//       state.error = null;
//       state.success = false;
//       state.serviceRequestId = null;
//     },
//     clearServiceRequestData: (state) => {
//       state.currentRequest = null;
//       state.customerRequests = [];
//       state.requestsByCategory = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Create service request
//       .addCase(createServiceRequest.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(createServiceRequest.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.success = true;
//         state.serviceRequestId = action.payload.data;
//       })
//       .addCase(createServiceRequest.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//         state.success = false;
//       })
//       // Get requests by customer
//       .addCase(getRequestsByCustomerId.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(getRequestsByCustomerId.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.customerRequests = action.payload;
//       })
//       .addCase(getRequestsByCustomerId.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })
//       // Get requests by category
//       .addCase(getRequestsByCategory.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(getRequestsByCategory.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.requestsByCategory = action.payload;
//       })
//       .addCase(getRequestsByCategory.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })
//       // Get service request by ID
//       .addCase(getServiceRequestById.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(getServiceRequestById.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.currentRequest = action.payload;
//       })
//       .addCase(getServiceRequestById.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// // Export actions and reducer
// export const { resetServiceRequestState, clearServiceRequestData } =
//   serviceRequestSlice.actions;
// export default serviceRequestSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

// Define interfaces for the service request data
interface ServiceRequestData {
  customerId: string;
  locationId: string;
  serviceCategoryId: string;
  description: string;
  serviceListIds: string[];

  // Location snapshot fields
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

interface ServiceRequestState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  serviceRequestId: string | null;
  customerRequests: any[];
  requestsByCategory: any[];
  currentRequest: any | null;
}

// Initial state
const initialState: ServiceRequestState = {
  isLoading: false,
  error: null,
  success: false,
  serviceRequestId: null,
  customerRequests: [],
  requestsByCategory: [],
  currentRequest: null,
};

// Create service request thunk
export const createServiceRequest = createAsyncThunk(
  "serviceRequest/create",
  async (requestData: ServiceRequestData, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().post(
        "/serviceRequest",
        requestData
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to create service request";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      dispatch(setMessage({ data: "Service request created successfully!" }));
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create service request";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Get requests by customer ID
export const getRequestsByCustomerId = createAsyncThunk(
  "serviceRequest/getByCustomer",
  async (customerId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceRequest/customer/${customerId}`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch customer requests";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch customer requests";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Get requests by category ID
export const getRequestsByCategory = createAsyncThunk(
  "serviceRequest/getByCategory",
  async (categoryId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceRequest/category/${categoryId}`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch category requests";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch category requests";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Get service request by ID
export const getServiceRequestById = createAsyncThunk(
  "serviceRequest/getById",
  async (requestId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceRequest/${requestId}`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch service request";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch service request";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Create the service request slice
const serviceRequestSlice = createSlice({
  name: "serviceRequest",
  initialState,
  reducers: {
    resetServiceRequestState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.serviceRequestId = null;
    },
    clearServiceRequestData: (state) => {
      state.currentRequest = null;
      state.customerRequests = [];
      state.requestsByCategory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create service request
      .addCase(createServiceRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createServiceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.serviceRequestId = action.payload.data;
      })
      .addCase(createServiceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Get requests by customer
      .addCase(getRequestsByCustomerId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRequestsByCustomerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerRequests = action.payload;
      })
      .addCase(getRequestsByCustomerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get requests by category
      .addCase(getRequestsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRequestsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requestsByCategory = action.payload;
      })
      .addCase(getRequestsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get service request by ID
      .addCase(getServiceRequestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServiceRequestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRequest = action.payload;
      })
      .addCase(getServiceRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { resetServiceRequestState, clearServiceRequestData } =
  serviceRequestSlice.actions;
export default serviceRequestSlice.reducer;
