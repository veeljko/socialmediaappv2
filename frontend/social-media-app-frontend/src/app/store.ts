import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "@/features/auth/authSlice";
import postReducer from "@/features/post/postSlice"
import { authApi } from "@/services/authApi";
import { postApi } from "@/services/postApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    [authApi.reducerPath]: authApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      postApi.middleware
    ),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);