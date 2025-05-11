import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { router } from "expo-router";
import Constants from "expo-constants";

// API URLs for different environments
const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL ?? "default_value";

const ANDROID_API_URL = BACKEND_API_URL;

interface DecodedToken extends JwtPayload {
  exp: number;
}

// Track refresh state to prevent multiple refresh attempts
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const getStoreAndActions = () => {
  const storeModule = require("../store/store");
  const authModule = require("../store/slice/auth");
  return {
    store: storeModule.store,
    logout: authModule.logout,
    refreshTokens: authModule.refreshTokens,
  };
};

const handleLogout = () => {
  const { store, logout } = getStoreAndActions();
  store.dispatch(logout());
  router.replace("/(auth)/login");
  console.log("User logged out due to authentication failure");
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

const getAxiosInstance = () => {
  const instance = axios.create({
    baseURL: ANDROID_API_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use(
    async (config) => {
      console.log("Making request to:", config.url);

      const publicEndpoints = ["/auth/login", "/users", "/OTP/verify", "/OTP/resend", "/serviceProvider", "/auth/verify-otp", "/auth/refresh", "/serviceCategory"];

      if (publicEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
        return config;
      }

      const { store, refreshTokens } = getStoreAndActions();
      let { accessToken, refreshToken } = store.getState().auth;

      if (!accessToken) {
        console.log("No authentication token found");
        handleLogout();
        return Promise.reject(new Error("No authentication token"));
      }

      // If token is expired but we have a refresh token
      if (isTokenExpired(accessToken)) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              resolve: (newToken: string) => {
                config.headers.Authorization = `Bearer ${newToken}`;
                resolve(config);
              },
              reject: (error: unknown) => {
                reject(error);
              },
            });
          });
        }

        isRefreshing = true;

        try {
          const result = await store.dispatch(refreshTokens());
          if (refreshTokens.fulfilled.match(result)) {
            accessToken = result.payload.accessToken;
            config.headers.Authorization = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            return config;
          } else {
            throw new Error("Failed to refresh token");
          }
        } catch (error) {
          processQueue(error);
          handleLogout();
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      console.log(`Response from ${response.config.url}: Status ${response.status}`);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        const { store, refreshTokens } = getStoreAndActions();
        const { refreshToken } = store.getState().auth;

        if (!refreshToken) {
          handleLogout();
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const result = await store.dispatch(refreshTokens());
          if (refreshTokens.fulfilled.match(result)) {
            const newAccessToken = result.payload.accessToken;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          handleLogout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export { getAxiosInstance };
