import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { type Post, type getPostResponse } from "@/features/post/types";
import type { createPostResponse, createPostRequest } from "@/features/post/types"
import type { isPostLikedByUserRequest, isPostLikedByUserResposne } from "@/features/post/types";


const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000",
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
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
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getPosts: builder.query<getPostResponse, string | void | null>({
      query: (cursor) => ({
        url: `/api/post/get-posts/?${cursor ? `cursor=${cursor}&` : ""}limit=3`,
        method: "GET",
      })
    }),
    createPost: builder.mutation<createPostResponse, FormData>({
      query: (post) => ({
        url: `/api/post/create-post`,
        method: "POST",
        body: post
      })
    }),
    likePost: builder.mutation<string, string>({
      query: (postId) => ({
        url: `/api/post/like-post/${postId}`,
        method: "POST",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData(
            "getPosts",
            undefined,
            (draft) => {
              const post = draft.posts.find(p => p._id === postId);
              if (post) {
                post.likesCount++;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    unlikePost: builder.mutation<string, string>({
      query: (postId) => ({
        url: `/api/post/unlike-post/${postId}`,
        method: "DELETE",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData(
            "getPosts",
            undefined,
            (draft) => {
              const post = draft.posts.find(p => p._id === postId);
              if (post) {
                post.likesCount--;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    isPostLikedByUser: builder.query<isPostLikedByUserResposne, isPostLikedByUserRequest>({
      query: ({ postId, userId }) => ({
        url: `/api/post/${postId}/is-liked-by/${userId}`,
        method: "GET",
      })
    }),
  }),
});

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useIsPostLikedByUserQuery,
} = postApi;