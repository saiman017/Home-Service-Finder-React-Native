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
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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

interface ServiceRequestResponseDto {
  id: string;
  customerId: string;
  customerName: string;
  locationId: string;
  serviceCategoryId: string;
  serviceCategoryName: string;
  description: string;
  createdAt: string;
  expiresAt: string;
  status: string;
  serviceListIds: string[];
  serviceListNames: string[];
  locationAddress: string;
  locationCity: string;
  locationPostalCode: string;
  locationLatitude: number;
  locationLongitude: number;
}

interface ServiceRequestState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  serviceRequestId: string | null;
  customerRequests: ServiceRequestResponseDto[];
  requestsByCategory: ServiceRequestResponseDto[];
  pendingRequests: ServiceRequestResponseDto[];
  activeRequests: ServiceRequestResponseDto[];
  allRequests: ServiceRequestResponseDto[];
  currentRequest: ServiceRequestResponseDto | null;
}

// Initial state
const initialState: ServiceRequestState = {
  isLoading: false,
  error: null,
  success: false,
  serviceRequestId: null,
  customerRequests: [],
  requestsByCategory: [],
  pendingRequests: [],
  activeRequests: [],
  allRequests: [],
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

// Get all service requests
export const getAllServiceRequests = createAsyncThunk(
  "serviceRequest/getAll",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get("/serviceRequest");
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch service requests";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch service requests";

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

// Get active requests by customer ID
export const getActiveRequestsByCustomerId = createAsyncThunk(
  "serviceRequest/getActiveByCustomer",
  async (customerId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceRequest/customer/${customerId}/active`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch active customer requests";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch active customer requests";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Get pending requests by customer ID
export const getPendingRequestsByCustomerId = createAsyncThunk(
  "serviceRequest/getPendingByCustomer",
  async (customerId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceRequest/customer/${customerId}/pending`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch pending customer requests";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch pending customer requests";

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

export const getPendingRequestsByCategory = createAsyncThunk(
  "serviceRequest/getPendingByCategory",
  async (categoryId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get(
        `/serviceRequest/${categoryId}/pending`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch pending category requests";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.code === 404) {
        return [];
      }
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch pending category requests";

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

// Update service request status
// export const updateServiceRequestStatus = createAsyncThunk(
//   "serviceRequest/updateStatus",
//   async (
//     { requestId, status }: { requestId: string; status: string },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const response = await getAxiosInstance().put(
//         `/serviceRequest/${requestId}/status`,
//         status
//       );
//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data ||
//           response.data.message ||
//           "Failed to update service request status";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }

//       dispatch(
//         setMessage({ data: "Service request status updated successfully!" })
//       );
//       return response.data.data;
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to update service request status";

//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

// // Cancel service request thunk
// export const cancelServiceRequest = createAsyncThunk(
//   "serviceRequest/cancel",
//   async (
//     { requestId, customerId }: { requestId: string; customerId: string },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const response = await getAxiosInstance().put(
//         `/serviceRequest/${requestId}/cancel`,
//         customerId
//       );

//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data ||
//           response.data.message ||
//           "Failed to cancel service request";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }

//       dispatch(setMessage({ data: "Service request Cancelled successfully!" }));
//       return response.data.data;
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to cancel service request";

//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

export const cancelServiceRequest = createAsyncThunk(
  "serviceRequest/cancel",
  async (
    { requestId, customerId }: { requestId: string; customerId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await getAxiosInstance().put(
        `/serviceRequest/${requestId}/cancel`,
        customerId
      );

      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to cancel service request";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      // Note: We don't need to manually update the UI here as SignalR will
      // send a CustomerRequestCancelled event which will update the UI

      dispatch(setMessage({ data: "Service request Cancelled successfully!" }));
      return { requestId, customerId };
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel service request";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const updateServiceRequestStatus = createAsyncThunk(
  "serviceRequest/updateStatus",
  async (
    { requestId, status }: { requestId: string; status: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await getAxiosInstance().put(
        `/serviceRequest/${requestId}/status`,
        status
      );

      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to update service request status";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      // Note: We don't need to manually update the UI here as SignalR will
      // send a RequestStatusUpdated or YourRequestStatusUpdated event

      dispatch(
        setMessage({ data: "Service request status updated successfully!" })
      );
      return { requestId, status };
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update service request status";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Delete service requests by customer ID
export const deleteRequestsByCustomerId = createAsyncThunk(
  "serviceRequest/deleteByCustomer",
  async (customerId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().delete(
        `/serviceRequest/customer/${customerId}`
      );
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to delete customer requests";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      dispatch(setMessage({ data: "Service requests deleted successfully!" }));
      return customerId;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete customer requests";

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
      state.currentRequest = null;
    },
    clearServiceRequestData: (state) => {
      state.currentRequest = null;
      state.customerRequests = [];
      state.requestsByCategory = [];
      state.pendingRequests = [];
      state.activeRequests = [];
      state.allRequests = [];
    },
    // Add these new reducers for SignalR updates
    updateServiceRequestStatusFromSignalR: (state, action) => {
      const { requestId, status } = action.payload;

      // Helper function to update status in any array
      const updateStatusInArray = (arr: ServiceRequestResponseDto[]) =>
        arr.map((req) => (req.id === requestId ? { ...req, status } : req));

      // Update all relevant arrays
      state.allRequests = updateStatusInArray(state.allRequests);
      state.customerRequests = updateStatusInArray(state.customerRequests);
      state.requestsByCategory = updateStatusInArray(state.requestsByCategory);
      state.activeRequests = updateStatusInArray(state.activeRequests);

      // Remove from pending if status changed from pending
      if (status !== "Pending") {
        state.pendingRequests = state.pendingRequests.filter(
          (req) => req.id !== requestId
        );
      }

      // Update current request if it's the one being updated
      const current = state.currentRequest;
      if (current && current.id === requestId) {
        current.status = status;
      }
    },
    handleRequestCancellationFromSignalR: (state, action) => {
      const { requestId, status } = action.payload;

      state.pendingRequests = (state.pendingRequests || [])
        .map((req) => (req.id === requestId ? { ...req, status } : req))
        .filter((req) => req.id !== requestId);

      state.requestsByCategory = state.requestsByCategory
        .map((req) => (req.id === requestId ? { ...req, status } : req))
        .filter((req) => req.id !== requestId); // Remove from category list

      // Keep in allRequests but update status
      state.allRequests = state.allRequests.map((req) =>
        req.id === requestId ? { ...req, status } : req
      );

      // Update currentRequest if matched
      if (state.currentRequest && state.currentRequest.id === requestId) {
        state.currentRequest.status = status;
      }
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

      // Get all service requests
      .addCase(getAllServiceRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllServiceRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allRequests = action.payload;
      })
      .addCase(getAllServiceRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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

      // Get active requests by customer
      .addCase(getActiveRequestsByCustomerId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActiveRequestsByCustomerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRequests = action.payload;
      })
      .addCase(getActiveRequestsByCustomerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get pending requests by customer
      .addCase(getPendingRequestsByCustomerId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingRequestsByCustomerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(getPendingRequestsByCustomerId.rejected, (state, action) => {
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
        state.requestsByCategory = action.payload || null;
      })
      .addCase(getRequestsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get pending requests by category
      .addCase(getPendingRequestsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingRequestsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingRequests = action.payload || [];
      })
      .addCase(getPendingRequestsByCategory.rejected, (state, action) => {
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
      })

      // Update service request status (real-time + manual)
      .addCase(updateServiceRequestStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(updateServiceRequestStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Cancel service request
      .addCase(cancelServiceRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelServiceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        const { requestId } = action.payload;
        state.pendingRequests = state.pendingRequests.filter(
          (req) => req.id !== requestId
        );
        state.requestsByCategory = state.requestsByCategory.map((req) =>
          req.id === requestId ? { ...req, status: "Cancelled" } : req
        );
      })
      .addCase(cancelServiceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete requests by customer
      .addCase(deleteRequestsByCustomerId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRequestsByCustomerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        const customerId = action.payload;
        state.customerRequests = [];
        state.activeRequests = [];
        state.pendingRequests = [];
        state.allRequests = state.allRequests.filter(
          (req) => req.customerId !== customerId
        );
      })
      .addCase(deleteRequestsByCustomerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  resetServiceRequestState,
  clearServiceRequestData,
  updateServiceRequestStatusFromSignalR,
  handleRequestCancellationFromSignalR,
} = serviceRequestSlice.actions;

export default serviceRequestSlice.reducer;
