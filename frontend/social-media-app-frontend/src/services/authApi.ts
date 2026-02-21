import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type { User, LoginBodyRequest, LoginResponse, RegisterBodyRequest } from "@/features/auth/types";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000",
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs,unknown,FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: "/api/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const authApi = createApi({
    reducerPath : "authApi",
    baseQuery : baseQueryWithReauth,
    endpoints: (builder) => ({
        loginUser : builder.mutation<User, LoginBodyRequest>({
            query : (newUser) => ({
                url: "/api/auth/login",
                method : "POST",
                body : newUser
            })
        }),
        registerUser : builder.mutation<User, RegisterBodyRequest>({
            query : (newUser) => ({
                url: "/api/auth/register",
                method : "POST",
                body : newUser
            })
        }),
        refreshToken : builder.query<User, void>({
            query : () => ({
                url : "/api/auth/refresh",
                method : "POST",
            })
        }),
        getAuthedUserInfo : builder.query<User, void>({
            query : () => ({
                url : "/api/auth/me",
                method : "GET",
            })
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/api/auth/logout",
                method: "POST",
            }),
        }),
    }),
});

export const {
    useLoginUserMutation, 
    useRegisterUserMutation,
    useRefreshTokenQuery,
    useGetAuthedUserInfoQuery,
    useLogoutMutation,
} = authApi;