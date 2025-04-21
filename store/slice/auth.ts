// import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
// import { getAxiosInstance } from "@/axios/axiosinstance";
// import { setMessage } from "./message";
// import { decodeBase64Data } from "@/utils/decoder";

// interface AuthState {
//   accessToken: string | null;
//   refreshToken: string | null;
//   email: string | null;
//   role: string | null;
//   isEmailVerified: boolean | null;
//   userId: string | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   otpRequired: boolean;
// }

// const initialState: AuthState = {
//   accessToken: null,
//   refreshToken: null,
//   email: null,
//   role: null,
//   userId: null,
//   isEmailVerified: null,
//   isLoading: false,
//   isAuthenticated: false,
//   otpRequired: false,
// };

// export const login = createAsyncThunk(
//   "auth/login",
//   async (
//     { email, password }: { email: string; password: string },
//     { rejectWithValue, dispatch }
//   ) => {
//     try {
//       const response = await getAxiosInstance().post("/auth/login", {
//         email,
//         password,
//       });

//       console.log("Login response:", JSON.stringify(response.data));

//       // Check if the response indicates OTP is required
//       if (response.data?.message?.includes("OTP sent")) {
//         console.log("OTP is required for email:", email);
//         // User is not verified, return email and otpRequired flag
//         return {
//           email,
//           otpRequired: true,
//           isEmailVerified: false,
//           userId: null,
//           accessToken: null,
//           refreshToken: null,
//           role: null,
//         };
//       }

//       const decoded = decodeBase64Data(response.data?.data);
//       console.log("Decoded login data:", decoded);

//       if (!decoded) {
//         throw new Error("Failed to decode login response");
//       }
//       if (!decoded.accessToken || !decoded.refreshToken) {
//         throw new Error("Missing tokens in response");
//       }
//       return {
//         ...decoded,
//         email,
//         otpRequired: false,
//       };
//     } catch (error: any) {
//       const message =
//         (error.response && error.response.data.data) ||
//         error.message ||
//         error.toString();
//       dispatch(setMessage({ data: message }));
//       return rejectWithValue(message);
//     }
//   }
// );
// export const checkPendingRequests = createAsyncThunk(
//   "auth/checkPendingRequests",
//   async (customerId: string, { rejectWithValue, dispatch }) => {
//     try {
//       const response = await getAxiosInstance().get(
//         `/serviceRequest/customer/${customerId}/active`
//       );
//       return response.data.data; // Returns array of pending requests
//     } catch (error) {
//       return rejectWithValue("Failed to check pending requests");
//     }
//   }
// );

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     saveToken: (
//       state,
//       action: PayloadAction<{
//         accessToken: string;
//         refreshToken: string;
//         email: string;
//         role: string;
//         userId: string;
//         isEmailVerified: boolean;
//       }>
//     ) => {
//       state.accessToken = action.payload.accessToken;
//       state.refreshToken = action.payload.refreshToken;
//       state.email = action.payload.email;
//       state.role = action.payload.role;
//       state.isEmailVerified = action.payload.isEmailVerified;
//       state.userId = action.payload.userId;
//       state.isAuthenticated = true;
//       state.isLoading = false;
//       state.otpRequired = false;
//     },
//     setEmail: (state, action: PayloadAction<string>) => {
//       state.email = action.payload;
//     },
//     setOtpRequired: (state, action: PayloadAction<boolean>) => {
//       state.otpRequired = action.payload;
//     },
//     clearEmail: (state) => {
//       state.email = null;
//     },
//     logout: (state) => {
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.email = null;
//       state.role = null;
//       state.isEmailVerified = null;
//       state.userId = null;
//       state.isAuthenticated = false;
//       state.otpRequired = false;
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.isLoading = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(login.pending, (state) => {
//         state.isLoading = true;
//         // Reset otpRequired flag when attempting login
//         state.otpRequired = false;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         if (action.payload) {
//           const {
//             accessToken,
//             refreshToken,
//             email,
//             role,
//             userId,
//             isEmailVerified,
//             otpRequired,
//           } = action.payload;

//           // // Set email in any case
//           // state.email = email;

//           // Check if OTP is required (email not verified)
//           if (otpRequired) {
//             console.log("Setting otpRequired flag to true");
//             state.otpRequired = true;
//             state.isEmailVerified = false;
//             state.isLoading = false;
//             state.isAuthenticated = false;
//             return;
//           }

//           // Regular login with tokens
//           if (accessToken && refreshToken) {
//             state.accessToken = accessToken;
//             state.refreshToken = refreshToken;
//             state.role = role;
//             state.userId = userId;
//             state.isEmailVerified = isEmailVerified;
//             state.isAuthenticated = true;
//             state.otpRequired = false;
//           }
//           state.isLoading = false;
//         }
//       })
//       .addCase(login.rejected, (state) => {
//         state.isLoading = false;
//         state.isAuthenticated = false;
//         state.otpRequired = false;
//       });
//   },
// });

// export const {
//   saveToken,
//   logout,
//   setLoading,
//   setEmail,
//   setOtpRequired,
//   clearEmail,
// } = authSlice.actions;
// export default authSlice.reducer;
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";
import { decodeBase64Data } from "@/utils/decoder";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface DecodedToken extends JwtPayload {
  exp: number;
  role?: string;
  userId?: string;
  isEmailVerified?: boolean;
}

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

const decodeAndValidateToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const decoded = decodeAndValidateToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp < Date.now() / 1000;
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

      if (response.data?.message?.includes("OTP sent")) {
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
      if (!decoded) throw new Error("Failed to decode login response");
      if (!decoded.accessToken || !decoded.refreshToken) {
        throw new Error("Missing tokens in response");
      }

      const tokenData = decodeAndValidateToken(decoded.accessToken);

      // Ensure userId is properly extracted and saved
      const userId = tokenData?.userId || decoded.userId || null;
      if (!userId) {
        throw new Error("User ID not found in token");
      }

      return {
        ...decoded,
        email,
        userId,
        otpRequired: false,
        role: tokenData?.role || null,
        isEmailVerified: tokenData?.isEmailVerified || false,
      };
    } catch (error: any) {
      const message =
        error.response?.data?.data || error.message || error.toString();
      dispatch(setMessage({ data: message }));
      return rejectWithValue(message);
    }
  }
);

export const refreshTokens = createAsyncThunk(
  "auth/refreshTokens",
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      if (!auth.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await getAxiosInstance().post("/auth/refresh", {
        refreshToken: auth.refreshToken,
      });

      const decoded = decodeBase64Data(response.data?.data);
      if (!decoded?.accessToken || !decoded?.refreshToken) {
        throw new Error("Invalid token refresh response");
      }

      const tokenData = decodeAndValidateToken(decoded.accessToken);

      return {
        accessToken: decoded.accessToken,
        refreshToken: decoded.refreshToken,
        role: tokenData?.role || auth.role,
        userId: tokenData?.userId || auth.userId,
        isEmailVerified: tokenData?.isEmailVerified ?? auth.isEmailVerified,
      };
    } catch (error: any) {
      dispatch(logout());
      const message =
        error.response?.data?.message || "Session expired. Please login again.";
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
      state.userId = action.payload.userId;
      state.isEmailVerified = action.payload.isEmailVerified;
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
      state.userId = null;
      state.isEmailVerified = null;
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
        state.otpRequired = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload) {
          const {
            accessToken,
            refreshToken,
            email,
            role,
            userId,
            isEmailVerified,
            otpRequired,
          } = action.payload;

          if (otpRequired) {
            state.otpRequired = true;
            state.isEmailVerified = false;
            state.email = email;
            state.isLoading = false;
            state.isAuthenticated = false;
            return;
          }

          if (accessToken && refreshToken && userId) {
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.email = email;
            state.role = role;
            state.userId = userId;
            state.isEmailVerified = isEmailVerified ?? false;
            state.isAuthenticated = true;
            state.otpRequired = false;
          }
        }
        state.isLoading = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.otpRequired = false;
      })
      .addCase(refreshTokens.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.role || state.role;
        state.userId = action.payload.userId || state.userId;
        state.isEmailVerified =
          action.payload.isEmailVerified ?? state.isEmailVerified;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
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
