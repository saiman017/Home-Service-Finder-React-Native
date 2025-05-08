import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/axios/axiosinstance";
import { setMessage } from "./message";

interface User {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  profilePicture?: string;
  role: string;
  createdAt: string;
  modifiedAt: string;
  isEmailVerified: boolean;
}

interface UserState {
  data: User[];
  currentUser: User | null;
  error: null | string;
}

const initialState: UserState = {
  data: [],
  currentUser: null,
  error: null,
};

export const fetchAllUsers = createAsyncThunk("users/fetch", async (_, thunkAPI) => {
  try {
    const response = await getAxiosInstance().get(`/users`);
    return response?.data?.data;
  } catch (error: any) {
    const message = (error.response && error.response.data.data) || error.message || error.toString();
    thunkAPI.dispatch(setMessage(message));
    return thunkAPI.rejectWithValue(message);
  }
});

// Thunk for fetching a user by ID
export const fetchUserById = createAsyncThunk("users/fetchById", async (id: string, thunkAPI) => {
  try {
    const response = await getAxiosInstance().get(`/users/${id}`);
    return response?.data?.data;
  } catch (error: any) {
    const message = (error.response && error.response.data.data) || error.message || error.toString();
    thunkAPI.dispatch(setMessage(message));
    return thunkAPI.rejectWithValue(message);
  }
});

// Thunk for editing a user
interface EditUserPayload {
  id: string;
  userData: Partial<User> | FormData;
}

export const editUser = createAsyncThunk("users/edit", async ({ id, userData }: EditUserPayload, thunkAPI) => {
  try {
    const response = await getAxiosInstance().put(`/users/${id}`, userData);
    return response?.data?.data;
  } catch (error: any) {
    const message = (error.response && error.response.data.data) || error.message || error.toString();
    thunkAPI.dispatch(setMessage(message));
    return thunkAPI.rejectWithValue(message);
  }
});

export const uploadProfilePicture = createAsyncThunk("users/uploadProfilePicture", async ({ id, file }: { id: string; file: FormData }, thunkAPI) => {
  try {
    const response = await getAxiosInstance().post(`/users/${id}/uploadProfilePicture`, file, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { id, profilePicture: response.data.data };
  } catch (error: any) {
    const message = (error.response && error.response.data.data) || error.message || error.toString() || "Failed to upload the image";
    thunkAPI.dispatch(setMessage(message));
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete profile picture
export const deleteProfilePicture = createAsyncThunk("users/deleteProfilePicture", async (id: string, thunkAPI) => {
  try {
    await getAxiosInstance().delete(`/users/${id}/deleteProfilePicture`);
    return { id };
  } catch (error: any) {
    const message = (error.response && error.response.data.data) || error.message || error.toString() || "Failed to deleted the image";
    thunkAPI.dispatch(setMessage(message));
    return thunkAPI.rejectWithValue(message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(editUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.data.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }

        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }

        state.error = null;
      })
      .addCase(editUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        const { id, profilePicture } = action.payload;
        const userIndex = state.data.findIndex((user) => user.id === id);
        if (userIndex !== -1) state.data[userIndex].profilePicture = profilePicture;
        if (state.currentUser?.id === id) {
          state.currentUser.profilePicture = profilePicture;
        }
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Handle deleteProfilePicture
      .addCase(deleteProfilePicture.fulfilled, (state, action) => {
        const { id } = action.payload;
        const userIndex = state.data.findIndex((user) => user.id === id);
        if (userIndex !== -1) state.data[userIndex].profilePicture = undefined;
        if (state.currentUser?.id === id) {
          state.currentUser.profilePicture = undefined;
        }
      })
      .addCase(deleteProfilePicture.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentUser } = userSlice.actions;

export const selectAllUsers = (state: { user: UserState }) => state.user.data;
export const selectUserById = (state: { user: UserState }) => state.user.currentUser;
export const selectUserError = (state: { user: UserState }) => state.user.error;

export default userSlice.reducer;
