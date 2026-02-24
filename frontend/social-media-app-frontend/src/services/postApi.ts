import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { type Post, type getPostResponse } from "@/features/post/types";

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

export const postApi = createApi({
    reducerPath : "postApi",
    baseQuery : baseQueryWithReauth,
    endpoints: (builder) => ({
        getPosts : builder.query<getPostResponse, string | void | null>({
            query : (cursor) => ({
                url: `/api/post/get-posts/?${cursor ? `cursor=${cursor}&` : ""}limit=3`,
                method : "GET",
            })
        })
    }),
});

export const {
    useGetPostsQuery, 
} = postApi;