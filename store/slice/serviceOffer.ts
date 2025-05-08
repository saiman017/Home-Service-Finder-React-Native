import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

// Interface for a service offer
interface ServiceOffer {
  id: string;
  serviceRequestId: string;
  serviceProviderId: string;
  providerName?: string;
  offeredPrice: number;
  sentAt: string;
  expiresAt: string;
  status: string;
  paymentStatus: boolean;
  paymentReason?: string | null;
  requestDetails?: {
    serviceCategoryName?: string;
    locationAddress?: string;
    locationCity?: string;
    description?: string;
    customerName?: string;
    customerPhone?: string;
    serviceListNames?: string[];
    createdAt?: string;
    expiresAt?: string;
    status?: string;
  };
}

interface StatusUpdateRequest {
  offerId: string;
  status: string;
  requestId: string;
  customerId: string;
}

interface PaymentUpdateRequest {
  offerId: string;
  paymentStatus: boolean;
}
// Interface for the service offer state
interface ServiceOfferState {
  isLoading: boolean;
  error: string | null;
  offers: ServiceOffer[];
  currentOffer: ServiceOffer | null;
  // Track the request IDs that have received offers from the current provider
  lastUpdated: number | null;
  requestsWithOffers: string[];
}

// Initial state
const initialState: ServiceOfferState = {
  isLoading: false,
  error: null,
  offers: [],
  currentOffer: null,
  lastUpdated: null,
  requestsWithOffers: [],
};

// Async thunk for sending a service offer
export const sendServiceOffer = createAsyncThunk(
  "serviceOffer/send",
  async (
    offerData: {
      serviceRequestId: string;
      serviceProviderId: string;
      offeredPrice: number;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await getAxiosInstance().post("/serviceOffer", offerData);

      if (!response.data.success || response.data.code >= 400) {
        const errorMessage = response.data.data || response.data.message || "Failed to send offer";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      dispatch(setMessage({ data: "Offer sent successfully!" }));
      return {
        ...response.data.data,
        serviceRequestId: offerData.serviceRequestId,
      };
    } catch (error: any) {
      const message = error.response?.data?.data || error.response?.data?.message || error.message || "Failed to send offer";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const updatePaymentStatus = createAsyncThunk<ServiceOffer, PaymentUpdateRequest, { rejectValue: string }>(
  "serviceOffer/updatePaymentStatus",
  async ({ offerId, paymentStatus }, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().put(`/serviceOffer/${offerId}/payment`, { paymentStatus });

      if (!response.data.success || response.data.code >= 400) {
        const err = response.data.data || response.data.message || "Failed to update payment";
        dispatch(setMessage({ data: err }));
        return rejectWithValue(err);
      }

      dispatch(setMessage({ data: "Payment status updated successfully!" }));
      return response.data.data as ServiceOffer;
    } catch (err: any) {
      const msg = err.response?.data?.data || err.response?.data?.message || err.message || "Failed to update payment";
      dispatch(setMessage({ data: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const updatePaymentReason = createAsyncThunk<ServiceOffer, { offerId: string; paymentReason: string }, { rejectValue: string }>(
  "serviceOffer/updatePaymentReason",
  async ({ offerId, paymentReason }, { rejectWithValue, dispatch }) => {
    try {
      const resp = await getAxiosInstance().put(`/serviceOffer/${offerId}/reason`, { paymentReason });
      if (!resp.data.success) throw new Error(resp.data.message);
      dispatch(setMessage({ data: "Reason submitted!" }));
      return resp.data.data as ServiceOffer;
    } catch (err: any) {
      const msg = err.message || "Failed";
      dispatch(setMessage({ data: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const updateOfferStatus = createAsyncThunk("serviceOffer/updateStatus", async (request: StatusUpdateRequest, { rejectWithValue, dispatch }) => {
  try {
    const response = await getAxiosInstance().put(`/serviceOffer/${request.offerId}/status`, {
      status: request.status,
      requestId: request.requestId,
      customerId: request.customerId,
    });

    if (!response.data.success || response.data.code >= 400) {
      const errorMessage = response.data.data || response.data.message || "Failed to update offer status";
      dispatch(setMessage({ data: errorMessage }));
      return rejectWithValue(errorMessage);
    }

    dispatch(
      setMessage({
        data: `Offer status updated to ${request.status} successfully!`,
      })
    );
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.data || error.response?.data?.message || error.message || "Failed to update offer status";

    dispatch(setMessage({ data: message }));
    return rejectWithValue(message);
  }
});

// Async thunk for fetching offers by request ID
export const getOffersByRequestId = createAsyncThunk("serviceOffer/getByRequestId", async (requestId: string, { rejectWithValue, dispatch }) => {
  try {
    const response = await getAxiosInstance().get(`/serviceOffer/request/${requestId}`);

    if (!response.data.success || response.data.code >= 400) {
      const errorMessage = response.data.data || response.data.message || "Failed to fetch offers";
      dispatch(setMessage({ data: errorMessage }));
      return rejectWithValue(errorMessage);
    }

    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.data || error.response?.data?.message || error.message || "Failed to fetch offers";

    dispatch(setMessage({ data: message }));
    return rejectWithValue(message);
  }
});

// Async thunk for fetching provider's offers
export const getProviderOffers = createAsyncThunk("serviceOffer/getByProviderId", async (providerId: string, { rejectWithValue, dispatch }) => {
  try {
    const response = await getAxiosInstance().get(`/serviceOffer/provider/${providerId}`);

    if (!response.data.success || response.data.code >= 400) {
      const errorMessage = response.data.data || response.data.message || "Failed to fetch offers";
      dispatch(setMessage({ data: errorMessage }));
      return rejectWithValue(errorMessage);
    }

    // Build the list of request IDs that already have offers
    const requestIds = response.data.data.map((offer: ServiceOffer) => offer.serviceRequestId);

    return {
      offers: response.data.data,
      requestIds,
    };
  } catch (error: any) {
    const message = error.response?.data?.data || error.response?.data?.message || error.message || "Failed to fetch offers";

    dispatch(setMessage({ data: message }));
    return rejectWithValue(message);
  }
});

// Async thunk for fetching a single offer by ID
export const getOfferById = createAsyncThunk("serviceOffer/getById", async (offerId: string, { rejectWithValue, dispatch }) => {
  try {
    // First get the offer
    const response = await getAxiosInstance().get(`serviceOffer/offer/${offerId}`);

    if (!response.data.success || response.data.code >= 400) {
      const errorMessage = response.data.data || response.data.message || "Failed to fetch offer";
      dispatch(setMessage({ data: errorMessage }));
      return rejectWithValue(errorMessage);
    }

    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.data || error.response?.data?.message || error.message || "Failed to fetch offer details";

    dispatch(setMessage({ data: message }));
    return rejectWithValue(message);
  }
});

// Async thunk for accepting an offer
export const acceptOffer = createAsyncThunk("serviceOffer/accept", async (data: { offerId: string; customerId: string }, { rejectWithValue, dispatch }) => {
  try {
    const response = await getAxiosInstance().put(`/serviceOffer/${data.offerId}/accept`, data.customerId);

    if (!response.data.success || response.data.code >= 400) {
      const errorMessage = response.data.data || response.data.message || "Failed to accept offer";
      dispatch(setMessage({ data: errorMessage }));
      return rejectWithValue(errorMessage);
    }

    dispatch(setMessage({ data: "Offer accepted successfully!" }));
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.data || error.response?.data?.message || error.message || "Failed to accept offer";

    dispatch(setMessage({ data: message }));
    return rejectWithValue(message);
  }
});

// Async thunk for rejecting an offer
export const rejectOffer = createAsyncThunk("serviceOffer/reject", async (data: { offerId: string; customerId: string }, { rejectWithValue, dispatch }) => {
  try {
    const response = await getAxiosInstance().put(`/serviceOffer/${data.offerId}/reject`, data.customerId);

    if (!response.data.success || response.data.code >= 400) {
      const errorMessage = response.data.data || response.data.message || "Failed to reject offer";
      dispatch(setMessage({ data: errorMessage }));
      return rejectWithValue(errorMessage);
    }

    dispatch(setMessage({ data: "Offer rejected successfully!" }));
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.data || error.response?.data?.message || error.message || "Failed to reject offer";

    dispatch(setMessage({ data: message }));
    return rejectWithValue(message);
  }
});

// Create the service offer slice
const serviceOfferSlice = createSlice({
  name: "serviceOffer",
  initialState,
  reducers: {
    resetServiceOfferState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    clearOffers: (state) => {
      state.offers = [];
    },
    setCurrentOffer: (state, action) => {
      state.currentOffer = action.payload;
    },
    clearCurrentOffer: (state) => {
      state.currentOffer = null;
    },
    clearRequestsWithOffers: (state) => {
      state.requestsWithOffers = [];
    },

    // New reducers for SignalR events
    addNewOffer: (state, action: PayloadAction<ServiceOffer>) => {
      // Check if this offer is already in the offers array
      const existingIndex = state.offers.findIndex((offer) => offer.id === action.payload.id);

      if (existingIndex === -1) {
        // Add the new offer
        state.offers.push(action.payload);
      } else {
        // Update the existing offer
        state.offers[existingIndex] = action.payload;
      }

      // Add to requestsWithOffers if it's not already there
      if (!state.requestsWithOffers.includes(action.payload.serviceRequestId)) {
        state.requestsWithOffers.push(action.payload.serviceRequestId);
      }
    },

    updateOfferFromSignalR: (state, action: PayloadAction<ServiceOffer>) => {
      // Update in offers array
      const offerIndex = state.offers.findIndex((offer) => offer.id === action.payload.id);

      if (offerIndex !== -1) {
        state.offers[offerIndex] = action.payload;
      }

      // Update currentOffer if it matches
      if (state.currentOffer && state.currentOffer.id === action.payload.id) {
        state.currentOffer = action.payload;
      }
    },

    handleOfferAcceptedFromSignalR: (state, action: PayloadAction<ServiceOffer>) => {
      // Update offer status in offers array
      const offerIndex = state.offers.findIndex((offer) => offer.id === action.payload.id);

      if (offerIndex !== -1) {
        state.offers[offerIndex].status = "Accepted";
      }

      // Update currentOffer if it matches
      if (state.currentOffer && state.currentOffer.id === action.payload.id) {
        state.currentOffer.status = "Accepted";
      }

      // Optionally mark all other offers for this request as rejected
      if (action.payload.serviceRequestId) {
        state.offers.forEach((offer) => {
          if (offer.serviceRequestId === action.payload.serviceRequestId && offer.id !== action.payload.id && offer.status === "Pending") {
            offer.status = "Rejected";
          }
        });
      }
    },
    handlePaymentUpdatedFromSignalR: (state, action: PayloadAction<ServiceOffer>) => {
      const updated = action.payload;
      const idx = state.offers.findIndex((o) => o.id === updated.id);
      if (idx !== -1) {
        state.offers[idx] = updated;
      }
      if (state.currentOffer?.id === updated.id) {
        state.currentOffer = updated;
      }
    },

    handleOfferRejectedFromSignalR: (state, action: PayloadAction<ServiceOffer>) => {
      // Update offer status in offers array
      const offerIndex = state.offers.findIndex((offer) => offer.id === action.payload.id);

      if (offerIndex !== -1) {
        state.offers[offerIndex].status = "Rejected";
      }

      // Update currentOffer if it matches
      if (state.currentOffer && state.currentOffer.id === action.payload.id) {
        state.currentOffer.status = "Rejected";
      }
    },

    handleOfferExpiredFromSignalR: (state, action: PayloadAction<ServiceOffer>) => {
      // Update offer status in offers array
      const offerIndex = state.offers.findIndex((offer) => offer.id === action.payload.id);

      if (offerIndex !== -1) {
        state.offers[offerIndex].status = "Expired";
      }

      // Update currentOffer if it matches
      if (state.currentOffer && state.currentOffer.id === action.payload.id) {
        state.currentOffer.status = "Expired";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Send service offer cases
      .addCase(sendServiceOffer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendServiceOffer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentOffer = action.payload;

        // Add the request ID to the list of requests with offers
        if (action.payload && action.payload.serviceRequestId) {
          state.requestsWithOffers.push(action.payload.serviceRequestId);
        }
      })
      .addCase(sendServiceOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get offers by request ID cases
      .addCase(getOffersByRequestId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOffersByRequestId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.offers = action.payload;
      })
      .addCase(getOffersByRequestId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.offers = [];
      })

      // Get offers by provider ID cases
      .addCase(getProviderOffers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProviderOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.offers = action.payload.offers;
        state.requestsWithOffers = action.payload.requestIds;
      })
      .addCase(getProviderOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.offers = [];
      })

      // Get offer by ID cases
      .addCase(getOfferById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOfferById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentOffer = action.payload;
      })
      .addCase(getOfferById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentOffer = null;
      })

      // Accept offer cases
      .addCase(acceptOffer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptOffer.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(acceptOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reject offer cases
      .addCase(rejectOffer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectOffer.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(rejectOffer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update offer status cases
      .addCase(updateOfferStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOfferStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // If the current offer is the one being updated, update its status
        if (state.currentOffer && state.currentOffer.id === action.meta.arg.offerId) {
          state.currentOffer.status = action.meta.arg.status;
        }
        // Update status in the offers array if present
        const index = state.offers.findIndex((offer) => offer.id === action.meta.arg.offerId);
        if (index !== -1) {
          state.offers[index].status = action.meta.arg.status;
        }
      })
      .addCase(updateOfferStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        const idx = state.offers.findIndex((o) => o.id === payload.id);
        if (idx !== -1) {
          state.offers[idx] = payload;
        } else {
          state.offers.push(payload);
        }
        if (state.currentOffer?.id === payload.id) {
          state.currentOffer = payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePaymentReason.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentReason.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const i = state.offers.findIndex((o) => o.id === payload.id);
        if (i > -1) state.offers[i] = payload;
        if (state.currentOffer?.id === payload.id) state.currentOffer = payload;
      })
      .addCase(updatePaymentReason.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetServiceOfferState,
  clearOffers,
  setCurrentOffer,
  clearCurrentOffer,
  clearRequestsWithOffers,
  addNewOffer,
  updateOfferFromSignalR,
  handleOfferAcceptedFromSignalR,
  handleOfferRejectedFromSignalR,
  handleOfferExpiredFromSignalR,
  handlePaymentUpdatedFromSignalR,
} = serviceOfferSlice.actions;

export default serviceOfferSlice.reducer;
