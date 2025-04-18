import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

interface ServiceCategoryState {
  isLoading: boolean;
  error: string | null;
  categories: any[];
  serviceCategoryId: string | null;
}

const initialState: ServiceCategoryState = {
  isLoading: false,
  error: null,
  categories: [],
  serviceCategoryId: null,
};

export const fetchServiceCategories = createAsyncThunk(
  "serviceProvider/serviceCategory/fetch",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await getAxiosInstance().get("/serviceCategory");

      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data ||
          response.data.message ||
          "Failed to fetch categories";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch categories";
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

const serviceCategorySlice = createSlice({
  name: "serviceCategory",
  initialState,
  reducers: {
    resetServiceCategoryState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    setSelectedCategoryId: (state, action) => {
      state.serviceCategoryId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.categories = action.payload.data || [];
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { resetServiceCategoryState, setSelectedCategoryId } =
  serviceCategorySlice.actions;
export default serviceCategorySlice.reducer;
