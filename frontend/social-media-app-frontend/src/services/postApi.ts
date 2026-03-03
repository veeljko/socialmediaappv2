import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { type Post, type getPostResponse } from "@/features/post/types";
import type { createPostResponse, createPostRequest } from "@/features/post/types"
import type { isPostLikedByUserRequest, isPostLikedByUserResposne } from "@/features/post/types";
import { removePost, setPosts } from "@/features/post/postSlice";
import { authApi } from "./authApi";

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
    createPost: builder.mutation<createPostResponse, FormData>({
      query: (post) => ({
        url: `/api/post/create-post`,
        method: "POST",
        body: post
      })
    }),
    likePost: builder.mutation<any, string>({
      query: (postId) => ({
        url: `/api/post/like-post/${postId}`,
        method: "POST",
      }),

      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        const patchPosts = dispatch(
          postApi.util.updateQueryData(
            "getPosts",
            undefined,
            (draft) => {
              draft.pages.forEach((page) => {
                const post = page.posts.find(p => p._id === postId);
                if (post) {
                  post.likesCount = (post.likesCount ?? 0) + 1;
                }
              });
            }
          )
        );

        const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, {subscribe : false}));
        let patchIsLiked;
        const userId = user.data?.id
        if (userId) {
          patchIsLiked = dispatch(
            postApi.util.updateQueryData(
              "isPostLikedByUser",
              { postId, userId },
              (draft: any) => {
                draft.answer = true;
              }
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchPosts.undo();
          if (patchIsLiked) patchIsLiked.undo();
        }
      },
    }),
    unlikePost: builder.mutation<string, string>({
      query: (postId) => ({
        url: `/api/post/unlike-post/${postId}`,
        method: "DELETE",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        const patchPosts = dispatch(
          postApi.util.updateQueryData(
            "getPosts",
            undefined,
            (draft) => {
              draft.pages.forEach((page) => {
                const post = page.posts.find(p => p._id === postId);
                if (post) {
                  post.likesCount = (post.likesCount ?? 0) - 1;
                }
              });
            }
          )
        );

        const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, {subscribe : false}));
        const userId = user.data?.id
        let patchIsLiked;
        if (userId) {
          patchIsLiked = dispatch(
            postApi.util.updateQueryData(
              "isPostLikedByUser",
              { postId, userId },
              (draft: any) => {
                draft.answer = false;
              }
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchPosts.undo();
          if (patchIsLiked) patchIsLiked.undo();
        }
      },
    }),
    isPostLikedByUser: builder.query<isPostLikedByUserResposne, isPostLikedByUserRequest>({
      query: ({ postId, userId }) => ({
        url: `/api/post/${postId}/is-liked-by/${userId}`,
        method: "GET",
      })
    }),
    getPostInfo: builder.query<Post, string>({
      query: (postId) => ({
        url: `/api/post/get-post-info/${postId}`,
        method: "GET",
      })
    }),
    deletePost: builder.mutation<{ message: string }, string>({
      query: (postId) => ({
        url: `/api/post/delete-post/${postId}`,
        method: "DELETE",
      }),
      
    }),
    getPosts: builder.infiniteQuery<getPostResponse, void, string | null>({
      infiniteQueryOptions: {
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
          if (lastPage.cursor?._id) return lastPage.cursor._id;
          return undefined;
        }
      },
      query({ pageParam }) {
        return `/api/post/get-posts/?${pageParam ? `cursor=${pageParam}&` : ""}limit=3`
      },
    }),
    getPostsByUser: builder.infiniteQuery<getPostResponse, string, string | null>({
      infiniteQueryOptions: {
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
          if (lastPage.cursor?._id) return lastPage.cursor._id;
          return undefined;
        }
      },
      query({ queryArg, pageParam }) {
        return `/api/post/get-posts-by-user/${queryArg}?${pageParam ? `cursor=${pageParam}&` : ""}limit=3`
      },
    })
  }),
});

export const {
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useIsPostLikedByUserQuery,
  useGetPostInfoQuery,
  useDeletePostMutation,
  useGetPostsInfiniteQuery,
  useGetPostsByUserInfiniteQuery
} = postApi;