import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import authReducer from "./slice/auth";
import messageReducer from "./slice/message";
import signupReducer from "./slice/signup";
import otpReducer from "./slice/otp";
import serviceProviderSignUpReducer from "./slice/serviceProviderSignUp";
import serviceCategoryReducer from "./slice/serviceCategory";
import userReducer from "./slice/user";
import locationReducer from "./slice/location";
import serviceListReducer from "./slice/serviceList";
import serviceRequestReducer from "./slice/serviceRequest";
import serviceProviderReducer from "./slice/serviceProvider";
import serviceOfferReducer from "./slice/serviceOffer";
import ratingReducer from "./slice/rating";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  message: messageReducer,
  signup: signupReducer,
  otp: otpReducer,
  serviceProviderSignUp: serviceProviderSignUpReducer,
  user: userReducer,
  serviceCategory: serviceCategoryReducer,
  location: locationReducer,
  serviceList: serviceListReducer,
  serviceRequest: serviceRequestReducer,
  serviceProvider: serviceProviderReducer,
  serviceOffer: serviceOfferReducer,
  rating: ratingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
