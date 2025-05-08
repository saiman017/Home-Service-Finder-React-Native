import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MessageState {
  data?: string | null;
}

const initialState: MessageState = {};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<{ data: string }>) => {
      return action.payload;
    },
    clearMessage: () => {
      return {};
    },
  },
});

// Selector
export const getMessage = (state: { message: MessageState }) => state.message;

const { reducer, actions } = messageSlice;
export const { setMessage, clearMessage } = actions;
export default reducer;
