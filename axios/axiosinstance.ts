// import axios from "axios";

// // For Android emulator
// const ANDROID_API_URL = "http://10.0.2.2:5039/api";

// const getAxiosInstance = () => {
//   const baseURL = ANDROID_API_URL;

//   const instance = axios.create({
//     baseURL,
//     timeout: 10000,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//   });

//   // Request interceptor
//   instance.interceptors.request.use(
//     (config) => {
//       console.log("Making request to:", config.url);
//       console.log("Method:", config.method?.toUpperCase());
//       if (config.data) {
//         console.log("Request data:", config.data);
//       }
//       return config;
//     },
//     (error) => {
//       console.error("Request error:", error);
//       return Promise.reject(error);
//     }
//   );

//   // Response interceptor
//   instance.interceptors.response.use(
//     (response) => {
//       console.log("Response from:", response.config.url);
//       console.log("Status:", response.status);
//       console.log("Data:", response.data);
//       return response;
//     },
//     (error) => {
//       console.error("Full error:", JSON.stringify(error, null, 2));
//       if (error.response) {
//         console.error("Response status:", error.response.status);
//         console.error("Response data:", error.response.data);
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Error message:", error.message);
//       }
//       return Promise.reject(error);
//     }
//   );

//   return instance;
// };

// export { getAxiosInstance };

// import axios from "axios";
// import { jwtDecode, JwtPayload } from "jwt-decode";
// import { store } from "../store/store"; // Import your Redux store
// import { logout } from "@/store/slice/auth"; // Import the logout action
// import { router } from "expo-router"; // Import expo-router for navigation

// // API URLs for different environments
// const ANDROID_API_URL = "http://10.0.2.2:5039/api";

// // Define a type that extends JwtPayload to ensure exp property exists
// interface DecodedToken extends JwtPayload {
//   exp: number;
// }

// // Helper function to check if the token is expired
// const isTokenExpired = (token: string): boolean => {
//   if (!token) return true;

//   try {
//     const decodedToken = jwtDecode<DecodedToken>(token);
//     const currentTime = Date.now() / 1000; // Current time in seconds

//     // Now TypeScript knows that decodedToken.exp exists
//     return decodedToken.exp < currentTime;
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true; // Assume expired if there's an error
//   }
// };

// const handleLogout = () => {
//   store.dispatch(logout());
//   router.replace("/(auth)/login");
//   console.log("User logged out due to token expiration");
// };

// const getAxiosInstance = () => {
//   // Choose the appropriate base URL based on platform
//   const baseURL = ANDROID_API_URL;

//   const instance = axios.create({
//     baseURL,
//     timeout: 10000,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//   });

//   // Request interceptor
//   instance.interceptors.request.use(
//     (config) => {
//       console.log("Making request to:", config.url);
//       const publicEndpoints = [
//         "/auth/login",
//         "/auth/register",
//         "/auth/verify-otp",
//       ];
//       if (publicEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
//         return config;
//       }

//       const { accessToken } = store.getState().auth;

//       if (accessToken) {
//         if (isTokenExpired(accessToken)) {
//           console.log("Token expired, logging out user");
//           handleLogout();
//           return Promise.reject(new Error("Authentication token expired"));
//         } else {
//           config.headers["Authorization"] = `Bearer ${accessToken}`;
//         }
//       } else {
//         console.log("No authentication token found");
//         if (!publicEndpoints.includes(config.url || "")) {
//           handleLogout();
//           return Promise.reject(new Error("No authentication token"));
//         }
//       }

//       return config;
//     },
//     (error) => {
//       console.error("Request interceptor error:", error);
//       return Promise.reject(error);
//     }
//   );

//   // Response interceptor
//   instance.interceptors.response.use(
//     (response) => {
//       console.log(
//         `Response from ${response.config.url}: Status ${response.status}`
//       );
//       return response;
//     },
//     (error) => {
//       if (error.response) {
//         console.error(
//           `Error ${error.response.status} from ${error.config?.url}:`,
//           error.response.data
//         );

//         // Handle 401 Unauthorized errors (token invalid or expired)
//         if (error.response.status === 401) {
//           console.log("Received 401 Unauthorized response, logging out");
//           handleLogout();
//         }
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Request error:", error.message);
//       }

//       return Promise.reject(error);
//     }
//   );

//   return instance;
// };

// export { getAxiosInstance };

// import axios from "axios";
// import { jwtDecode, JwtPayload } from "jwt-decode";
// import { router } from "expo-router"; // Import expo-router for navigation

// // API URLs for different environments
// const ANDROID_API_URL = "http://10.0.2.2:5039/api";

// // Define a type that extends JwtPayload to ensure exp property exists
// interface DecodedToken extends JwtPayload {
//   exp: number;
// }

// // Helper function to check if the token is expired
// const isTokenExpired = (token: string): boolean => {
//   if (!token) return true;

//   try {
//     const decodedToken = jwtDecode<DecodedToken>(token);
//     const currentTime = Date.now() / 1000; // Current time in seconds
//     return decodedToken.exp < currentTime;
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true; // Assume expired if there's an error
//   }
// };

// // This function will not cause circular dependency because it doesn't immediately
// // evaluate imports - it only accesses them when the function is called
// const getStoreAndActions = () => {
//   // Dynamically import the store and actions to avoid circular dependencies
//   // These imports will only be resolved when this function is called
//   const storeModule = require("../store/store");
//   const authModule = require("../store/slice/auth");

//   return {
//     store: storeModule.store,
//     logout: authModule.logout,
//   };
// };

// const handleLogout = () => {
//   const { store, logout } = getStoreAndActions();
//   store.dispatch(logout());
//   router.replace("/(auth)/login");
//   console.log("User logged out due to token expiration");
// };

// const getAxiosInstance = () => {
//   // Choose the appropriate base URL based on platform
//   const baseURL = ANDROID_API_URL;

//   const instance = axios.create({
//     baseURL,
//     timeout: 10000,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//   });

//   // Request interceptor
//   instance.interceptors.request.use(
//     (config) => {
//       console.log("Making request to:", config.url);
//       const publicEndpoints = [
//         "/auth/login",
//         "/auth/register",
//         "/auth/verify-otp",
//         "/serviceCategory",
//       ];
//       if (publicEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
//         return config;
//       }

//       // Dynamically get store state to avoid circular dependency
//       const { store } = getStoreAndActions();
//       const { accessToken } = store.getState().auth;

//       if (accessToken) {
//         if (isTokenExpired(accessToken)) {
//           console.log("Token expired, logging out user");
//           handleLogout();
//           return Promise.reject(new Error("Authentication token expired"));
//         } else {
//           config.headers["Authorization"] = `Bearer ${accessToken}`;
//         }
//       } else {
//         console.log("No authentication token found");
//         if (!publicEndpoints.includes(config.url || "")) {
//           handleLogout();
//           return Promise.reject(new Error("No authentication token"));
//         }
//       }

//       return config;
//     },
//     (error) => {
//       console.error("Request interceptor error:", error);
//       return Promise.reject(error);
//     }
//   );

//   // Response interceptor
//   instance.interceptors.response.use(
//     (response) => {
//       console.log(
//         `Response from ${response.config.url}: Status ${response.status}`
//       );
//       return response;
//     },
//     (error) => {
//       if (error.response) {
//         console.error(
//           `Error ${error.response.status} from ${error.config?.url}:`,
//           error.response.data
//         );

//         // Handle 401 Unauthorized errors (token invalid or expired)
//         if (error.response.status === 401) {
//           console.log("Received 401 Unauthorized response, logging out");
//           handleLogout();
//         }
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Request error:", error.message);
//       }

//       return Promise.reject(error);
//     }
//   );

//   return instance;
// };

// export { getAxiosInstance };

import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { router } from "expo-router";

// API URLs for different environments
const ANDROID_API_URL = "http://10.0.2.2:5039/api";

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

      const publicEndpoints = [
        "/auth/login",
        "/auth/register",
        "/auth/verify-otp",
        "/auth/refresh",
        "/serviceCategory",
      ];

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
      console.log(
        `Response from ${response.config.url}: Status ${response.status}`
      );
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

// import axios from "axios";
// import { Platform } from "react-native";
// import { jwtDecode, JwtPayload } from "jwt-decode";
// import { router } from "expo-router";

// // Determine API base URL based on the platform
// const getApiUrl = () => {
//   if (Platform.OS === "android") {
//     return "http://10.0.2.2:5039/api"; // Android emulator
//   } else if (Platform.OS === "ios") {
//     return "http://localhost:5039/api"; // iOS simulator
//   } else {
//     // You can replace this with your dev machine's IP for real devices
//     return "http://192.168.18.243:5039/api"; // Web or fallback
//   }
// };

// // Define a type that extends JwtPayload to ensure exp property exists
// interface DecodedToken extends JwtPayload {
//   exp: number;
// }

// const isTokenExpired = (token: string): boolean => {
//   if (!token) return true;

//   try {
//     const decodedToken = jwtDecode<DecodedToken>(token);
//     const currentTime = Date.now() / 1000;
//     return decodedToken.exp < currentTime;
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true;
//   }
// };

// const getStoreAndActions = () => {
//   const storeModule = require("../store/store");
//   const authModule = require("../store/slice/auth");

//   return {
//     store: storeModule.store,
//     logout: authModule.logout,
//   };
// };

// const handleLogout = () => {
//   const { store, logout } = getStoreAndActions();
//   store.dispatch(logout());
//   router.replace("/(auth)/login");
//   console.log("User logged out due to token expiration");
// };

// const getAxiosInstance = () => {
//   const baseURL = getApiUrl();

//   const instance = axios.create({
//     baseURL,
//     timeout: 10000,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//   });

//   instance.interceptors.request.use(
//     (config) => {
//       console.log("Making request to:", config.url);
//       const publicEndpoints = [
//         "/auth/login",
//         "/auth/register",
//         "/auth/verify-otp",
//       ];

//       if (publicEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
//         return config;
//       }

//       const { store } = getStoreAndActions();
//       const { accessToken } = store.getState().auth;

//       if (accessToken) {
//         if (isTokenExpired(accessToken)) {
//           console.log("Token expired, logging out user");
//           handleLogout();
//           return Promise.reject(new Error("Authentication token expired"));
//         } else {
//           config.headers["Authorization"] = `Bearer ${accessToken}`;
//         }
//       } else {
//         console.log("No authentication token found");
//         if (!publicEndpoints.includes(config.url || "")) {
//           handleLogout();
//           return Promise.reject(new Error("No authentication token"));
//         }
//       }

//       return config;
//     },
//     (error) => {
//       console.error("Request interceptor error:", error);
//       return Promise.reject(error);
//     }
//   );

//   instance.interceptors.response.use(
//     (response) => {
//       console.log(
//         `Response from ${response.config.url}: Status ${response.status}`
//       );
//       return response;
//     },
//     (error) => {
//       if (error.response) {
//         console.error(
//           `Error ${error.response.status} from ${error.config?.url}:`,
//           error.response.data
//         );

//         if (error.response.status === 401) {
//           console.log("Received 401 Unauthorized response, logging out");
//           handleLogout();
//         }
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Request error:", error.message);
//       }

//       return Promise.reject(error);
//     }
//   );

//   return instance;
// };

// export { getAxiosInstance };
