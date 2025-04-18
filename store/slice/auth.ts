import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";
import { decodeBase64Data } from "@/utils/decoder";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  role: string | null;
  isEmailVerified: boolean | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  otpRequired: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  email: null,
  role: null,
  userId: null,
  isEmailVerified: null,
  isLoading: false,
  isAuthenticated: false,
  otpRequired: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await getAxiosInstance().post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", JSON.stringify(response.data));

      // Check if the response indicates OTP is required
      if (response.data?.message?.includes("OTP sent")) {
        console.log("OTP is required for email:", email);
        // User is not verified, return email and otpRequired flag
        return {
          email,
          otpRequired: true,
          isEmailVerified: false,
          userId: null,
          accessToken: null,
          refreshToken: null,
          role: null,
        };
      }

      const decoded = decodeBase64Data(response.data?.data);
      console.log("Decoded login data:", decoded);

      if (!decoded) {
        throw new Error("Failed to decode login response");
      }
      if (!decoded.accessToken || !decoded.refreshToken) {
        throw new Error("Missing tokens in response");
      }
      return {
        ...decoded,
        email,
        otpRequired: false,
      };
    } catch (error: any) {
      const message =
        (error.response && error.response.data.data) ||
        error.message ||
        error.toString();
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    saveToken: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        email: string;
        role: string;
        userId: string;
        isEmailVerified: boolean;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isEmailVerified = action.payload.isEmailVerified;
      state.userId = action.payload.userId;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.otpRequired = false;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setOtpRequired: (state, action: PayloadAction<boolean>) => {
      state.otpRequired = action.payload;
    },
    clearEmail: (state) => {
      state.email = null;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.email = null;
      state.role = null;
      state.isEmailVerified = null;
      state.userId = null;
      state.isAuthenticated = false;
      state.otpRequired = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        // Reset otpRequired flag when attempting login
        state.otpRequired = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload) {
          const {
            accessToken,
            refreshToken,
            email,
            role,
            isEmailVerified,
            otpRequired,
          } = action.payload;

          // // Set email in any case
          // state.email = email;

          // Check if OTP is required (email not verified)
          if (otpRequired) {
            console.log("Setting otpRequired flag to true");
            state.otpRequired = true;
            state.isEmailVerified = false;
            state.isLoading = false;
            state.isAuthenticated = false;
            return;
          }

          // Regular login with tokens
          if (accessToken && refreshToken) {
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.role = role;
            state.userId = action.payload.userId;
            state.isEmailVerified = isEmailVerified;
            state.isAuthenticated = true;
            state.otpRequired = false;
          }
          state.isLoading = false;
        }
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.otpRequired = false;
      });
  },
});

export const {
  saveToken,
  logout,
  setLoading,
  setEmail,
  setOtpRequired,
  clearEmail,
} = authSlice.actions;
export default authSlice.reducer;
