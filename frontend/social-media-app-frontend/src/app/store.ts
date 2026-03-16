import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "@/services/authApi";
import { postApi } from "@/services/postApi";
import { followApi } from "@/services/followerApi";
import { commentApi } from "@/services/commentApi";
import { darkModeSlice } from "@/features/theme/darkMode";

export const store = configureStore({
  reducer: {
    darkMode : darkModeSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [followApi.reducerPath] : followApi.reducer,
    [commentApi.reducerPath] : commentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      postApi.middleware,
      followApi.middleware,
      commentApi.middleware
    ),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);