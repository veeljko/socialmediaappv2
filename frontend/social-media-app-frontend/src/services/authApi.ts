import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthUser, LoginBodyRequest, LoginResponse, RegisterBodyRequest, User } from "@/features/auth/types";

export const authApi = createApi({
    reducerPath : "authApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:3000/',
        credentials: "include",
     }),
    endpoints: (builder) => ({
        loginUser : builder.mutation<LoginResponse, LoginBodyRequest>({
            query : (newUser) => ({
                url: "/api/auth/login",
                method : "POST",
                body : newUser
            })
        }),
        registerUser : builder.mutation<LoginResponse, RegisterBodyRequest>({
            query : (newUser) => ({
                url: "/api/auth/register",
                method : "POST",
                body : newUser
            })
        }),
        refreshToken : builder.mutation<AuthUser, void>({
            query : () => ({
                url : "/api/auth/refresh",
                method : "POST",
                credentials: "include",
            })
        })
    }),
});

export const {
    useLoginUserMutation, 
    useRegisterUserMutation,
    useRefreshTokenMutation,
} = authApi;