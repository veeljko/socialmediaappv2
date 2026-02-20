import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./types.ts";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    finishLoading(state) {
      state.loading = false;
    },
  },
});

export const { setUser, logout, finishLoading } = authSlice.actions;
export default authSlice.reducer;