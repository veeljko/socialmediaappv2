import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { authReqBody } from "@/features/auth/types";

export const authApi = createApi({
    reducerPath : "",
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/' }),
    endpoints: (builder) => ({
        loginUser : builder.mutation({
            query : (newUser : authReqBody) => ({
                url: "/api/auth/login",
                method : "POST",
                body : newUser
            })
        }),
        registerUser : builder.mutation({
            query : (newUser : authReqBody) => ({
                url: "/api/auth/register",
                method : "POST",
                body : newUser
            })
        }),
    }),
});

export const {useLoginUserMutation, useRegisterUserMutation} = authApi;