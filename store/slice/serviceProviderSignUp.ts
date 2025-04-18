// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { getAxiosInstance } from "@/axios/axiosinstance";
// import { setMessage } from "./message";
// import { setOtpRequired } from "@/store/slice/auth";

// // Interface for the signup state
// interface ServiceProviderSignupState {
//   isLoading: boolean;
//   error: string | null;
//   email: string | null;
// }

// // Initial state
// const initialState: ServiceProviderSignupState = {
//   isLoading: false,
//   error: null,
//   email: null,
// };

// // Async thunk for user registration
// export const serviceProviderSignUp = createAsyncThunk(
//   "serviceProvider/signUp",
//   async (
//     serviceProviderData: {
//       firstName: string;
//       lastName: string;
//       email: string;
//       phoneNumber: string;
//       password: string;
//       confirmPassword: string;
//       gender: string;
//       dateOfBirth: string;
//       roleId: string;
//       serviceCategoryId: string;
//     },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const response = await getAxiosInstance().post(
//         "/serviceProvider",
//         serviceProviderData
//       );

//       // Check for success response
//       if (!response.data.success || response.data.code >= 400) {
//         const errorMessage =
//           response.data.data || response.data.message || "Registration failed";
//         dispatch(setMessage({ data: errorMessage }));
//         return rejectWithValue(errorMessage);
//       }
//       // // Store the email for OTP verification
//       // dispatch(setEmail(serviceProviderData.email));

//       // // Set OTP required flag in auth slice
//       // dispatch(setOtpRequired(true));

//       // Store email for OTP verification
//       dispatch(setMessage({ data: "Registration successful" }));
//       return {
//         ...response.data,
//         email: serviceProviderData.email,
//       };
//     } catch (error: any) {
//       const message =
//         error.response?.data?.data ||
//         error.response?.data?.message ||
//         error.message ||
//         "SignUp failed";

//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );

// // Create the signup slice
// const serviceProviderSignupSlice = createSlice({
//   name: "serviceProviderSignUp", // Changed to match the state selector name
//   initialState,
//   reducers: {
//     resetSignupState: (state) => {
//       state.isLoading = false;
//       state.error = null;
//     },
//     setEmail: (state, action) => {
//       state.email = action.payload;
//     },
//     clearEmail: (state) => {
//       state.email = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(serviceProviderSignUp.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(serviceProviderSignUp.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.error = null;
//         state.email = action.payload.email;
//       })
//       .addCase(serviceProviderSignUp.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// // Export actions and reducer
// export const { resetSignupState, setEmail, clearEmail } =
//   serviceProviderSignupSlice.actions;
// export default serviceProviderSignupSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";
import { setOtpRequired } from "@/store/slice/auth";
import { resendOTP } from "./otp"; // Import the resendOTP action

// Interface for the signup state
interface ServiceProviderSignupState {
  isLoading: boolean;
  error: string | null;
  email: string | null;
}

// Initial state
const initialState: ServiceProviderSignupState = {
  isLoading: false,
  error: null,
  email: null,
};

// Async thunk for service provider registration
export const serviceProviderSignUp = createAsyncThunk(
  "serviceProvider/signUp",
  async (
    serviceProviderData: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      password: string;
      confirmPassword: string;
      gender: string;
      dateOfBirth: string;
      experience: number;
      personalDescription: string;
      roleId: string;
      serviceCategoryId: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      // Register the service provider
      const response = await getAxiosInstance().post(
        "/serviceProvider",
        serviceProviderData
      );

      // Check for success response
      if (!response.data.success || response.data.code >= 400) {
        const errorMessage =
          response.data.data || response.data.message || "Registration failed";
        dispatch(setMessage({ data: errorMessage }));
        return rejectWithValue(errorMessage);
      }

      // Store email for OTP verification in this slice
      dispatch(setEmail(serviceProviderData.email));

      // Explicitly request an OTP for the service provider
      try {
        await dispatch(
          resendOTP({ Email: serviceProviderData.email })
        ).unwrap();
        console.log(
          "OTP requested for service provider:",
          serviceProviderData.email
        );
      } catch (otpError) {
        console.error("Failed to request OTP:", otpError);
        // We can still continue even if OTP request fails, as the account is created
      }

      dispatch(setMessage({ data: "Registration successful" }));
      return {
        ...response.data,
        email: serviceProviderData.email,
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
const serviceProviderSignupSlice = createSlice({
  name: "serviceProviderSignUp",
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
      .addCase(serviceProviderSignUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(serviceProviderSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.email = action.payload.email;
      })
      .addCase(serviceProviderSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { resetSignupState, setEmail, clearEmail } =
  serviceProviderSignupSlice.actions;
export default serviceProviderSignupSlice.reducer;
