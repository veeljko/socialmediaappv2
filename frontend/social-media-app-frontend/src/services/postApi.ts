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
    likePost: builder.mutation<any, string>({
      query: (postId) => ({
        url: `/api/post/like-post/${postId}`,
        method: "POST",
      }),

      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        const patchPostInfo = dispatch(
          postApi.util.updateQueryData("getPostInfo", postId, (draft: Post) => {
            draft.likesCount = (draft.likesCount ?? 0) + 1;
          })
        );
        const userId = (getState() as any).auth.user?.id;
        let patchIsLiked;
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
          patchPostInfo.undo();
          if (userId && patchIsLiked) patchIsLiked.undo();
        }

      },
    }),
    unlikePost: builder.mutation<string, string>({
      query: (postId) => ({
        url: `/api/post/unlike-post/${postId}`,
        method: "DELETE",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        const patchPostInfo = dispatch(
          postApi.util.updateQueryData("getPostInfo", postId, (draft: Post) => {
            draft.likesCount = (draft.likesCount ?? 0) - 1;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchPostInfo.undo();
        }

        const userId = (getState() as any).auth.user?.id;
        if (userId) {
          const patchIsLiked = dispatch(
            postApi.util.updateQueryData(
              "isPostLikedByUser",
              { postId, userId },
              (draft: any) => {
                draft.answer = false;
              }
            )
          );

          try { await queryFulfilled; }
          catch { patchIsLiked.undo(); }
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
    getPostsByUser: builder.query<getPostResponse, { userId: string, cursor: string | null | undefined | void }>({
      query: ({ userId, cursor }) => ({
        url: `/api/post/get-posts-by-user/${userId}?${cursor ? `cursor=${cursor}&` : ""}limit=3`,
        method: "GET",
      })
    }),
    deletePost: builder.mutation<{ message: string }, string>({
      query: (postId) => ({
        url: `/api/post/delete-post/${postId}`,
        method: "DELETE",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {

        const previousPosts = (getState() as any).post.feed;

        dispatch(removePost(postId));

        try {
          await queryFulfilled;
        } catch {
          dispatch(setPosts(previousPosts));
        }
      }
    })
  }),
});

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useIsPostLikedByUserQuery,
  useGetPostInfoQuery,
  useGetPostsByUserQuery,
  useDeletePostMutation,
} = postApi;