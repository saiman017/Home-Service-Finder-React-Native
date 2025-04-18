import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

// Interface for the signup state
interface SignupState {
  isLoading: boolean;
  error: string | null;
  email: string | null;
}

// Initial state
const initialState: SignupState = {
  isLoading: false,
  error: null,
  email: null,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  "signup/register",
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      password: string;
      confirmPassword: string;
      gender: string;
      dateOfBirth: string;
      roleId: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await getAxiosInstance().post("/users", userData);
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data || response.data.message || "Registration failed";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      // Store email for OTP verification
      return {
        ...response.data,
        email: userData.email, // Ensure email is included in the payload
      };
    } catch (error: any) {
      const message =
        error.response?.data?.data ||
        error.response?.data?.message ||
        error.message ||
        "SignUp failed";

      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

// Create the signup slice
const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    resetSignupState: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    clearEmail: (state) => {
      state.email = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.email = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { resetSignupState, setEmail, clearEmail } = signupSlice.actions;
export default signupSlice.reducer;
