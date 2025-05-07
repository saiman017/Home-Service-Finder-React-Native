import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

// --- Types ---
export interface Rating {
  id: string;
  customerId: string;
  serviceProviderId: string;
  value: number;
  comments?: string;
  createdAt: string;
}

export interface RatingStats {
  serviceProviderId: string;
  count: number;
  sum: number;
  average: number;
}

interface RatingRequest {
  userId: string; // Added userId
  serviceProviderId: string;
  value: number;
  comments?: string;
  serviceRequestId?: string;
}

interface RatingState {
  ratings: Rating[];
  stats: RatingStats | null;
  loading: boolean;
  error: string | null;
  statsLoading: boolean;
  statsError: string | null;
}

// --- Initial state ---
const initialState: RatingState = {
  ratings: [],
  stats: null,
  loading: false,
  error: null,
  statsLoading: false,
  statsError: null,
};

// --- Thunks ---
// 1) POST a new rating
export const addRating = createAsyncThunk<Rating, RatingRequest, { rejectValue: string; dispatch: any }>("rating/add", async (payload, { rejectWithValue, dispatch }) => {
  try {
    const res = await getAxiosInstance().post("/rating", payload);
    const { success, code, data, message } = res.data;
    if (!success || code >= 400) {
      const err = data || message || "Failed to submit rating";
      dispatch(setMessage({ data: err }));
      return rejectWithValue(err);
    }
    return data as Rating;
  } catch (err: any) {
    const msg = err.response?.data?.data || err.response?.data?.message || err.message || "Failed to submit rating";
    dispatch(setMessage({ data: msg }));
    return rejectWithValue(msg);
  }
});

// 2) GET all ratings for one provider
export const fetchRatingsByProvider = createAsyncThunk<Rating[], string, { rejectValue: string; dispatch: any }>("rating/fetchByProvider", async (providerId, { rejectWithValue, dispatch }) => {
  try {
    const res = await getAxiosInstance().get(`/rating/provider/${providerId}`);
    const { success, code, data, message } = res.data;
    if (!success || code >= 400) {
      const err = data || message || "Failed to fetch ratings";
      dispatch(setMessage({ data: err }));
      return rejectWithValue(err);
    }
    return data as Rating[];
  } catch (err: any) {
    const msg = err.response?.data?.data || err.response?.data?.message || err.message || "Failed to fetch ratings";
    dispatch(setMessage({ data: msg }));
    return rejectWithValue(msg);
  }
});

// 3) GET stats (count, sum, average) for a provider
export const fetchRatingStats = createAsyncThunk<RatingStats, string, { rejectValue: string; dispatch: any }>("rating/fetchStats", async (providerId, { rejectWithValue, dispatch }) => {
  try {
    const res = await getAxiosInstance().get(`/rating/provider/${providerId}/stats`);
    const { success, code, data, message } = res.data;
    if (!success || code >= 400) {
      const err = data || message || "Failed to fetch rating stats";
      dispatch(setMessage({ data: err }));
      return rejectWithValue(err);
    }
    return data as RatingStats;
  } catch (err: any) {
    const msg = err.response?.data?.data || err.response?.data?.message || err.message || "Failed to fetch rating stats";
    dispatch(setMessage({ data: msg }));
    return rejectWithValue(msg);
  }
});

// --- Slice ---
const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    resetRatingState(state) {
      state.loading = false;
      state.error = null;
    },
    clearRatings(state) {
      state.ratings = [];
    },
    resetStatsState(state) {
      state.statsLoading = false;
      state.statsError = null;
    },
    clearStats(state) {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    // addRating
    builder
      .addCase(addRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRating.fulfilled, (state, action: PayloadAction<Rating>) => {
        state.loading = false;
        state.ratings.push(action.payload);
      })
      .addCase(addRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchRatingsByProvider
    builder
      .addCase(fetchRatingsByProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatingsByProvider.fulfilled, (state, action: PayloadAction<Rating[]>) => {
        state.loading = false;
        state.ratings = action.payload;
      })
      .addCase(fetchRatingsByProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchRatingStats
    builder
      .addCase(fetchRatingStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchRatingStats.fulfilled, (state, action: PayloadAction<RatingStats>) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchRatingStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      });
  },
});

export const { resetRatingState, clearRatings, resetStatsState, clearStats } = ratingSlice.actions;

export default ratingSlice.reducer;
