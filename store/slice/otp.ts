import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";

interface OTPState {
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
  success: boolean;
  resendSuccess: boolean;
}

interface VerifyOTPPayload {
  Email: string;
  OTPCode: string;
}

interface ResendOTPPayload {
  Email: string;
}

const initialState: OTPState = {
  isVerifying: false,
  isResending: false,
  error: null,
  success: false,
  resendSuccess: false,
};

export const verifyOTP = createAsyncThunk(
  "otp/verify",
  async (payload: VerifyOTPPayload, { rejectWithValue }) => {
    try {
      const response = await getAxiosInstance().post("/OTP/verify", payload);
      return response.data;
    } catch (error: any) {
      const message =
        (error.response && error.response.data.data) ||
        error.message ||
        error.toString() ||
        "Network error: Unable to verify OTP";
      return rejectWithValue(message);
    }
  }
);

// for otpresend
export const resendOTP = createAsyncThunk(
  "otp/resend",
  async (payload: ResendOTPPayload, { rejectWithValue }) => {
    try {
      const response = await getAxiosInstance().post("/OTP/resend", payload);
      return response.data;
    } catch (error: any) {
      const message =
        (error.response && error.response.data.data) ||
        error.message ||
        error.toString() ||
        "Network error: Unable to resend OTP";
      return rejectWithValue(message);
    }
  }
);

const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {
    resetOtp: (state) => {
      state.isVerifying = false;
      state.isResending = false;
      state.error = null;
      state.success = false;
      state.resendSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // OTP Verification
      .addCase(verifyOTP.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isVerifying = false;
        state.success = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload as string;
      })

      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.isResending = true;
        state.error = null;
        state.resendSuccess = false;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isResending = false;
        state.resendSuccess = true;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isResending = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOtp } = otpSlice.actions;
export default otpSlice.reducer;
