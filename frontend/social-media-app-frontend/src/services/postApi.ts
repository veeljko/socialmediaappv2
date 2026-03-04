import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { type Post, type getPostResponse } from "@/features/post/types";
import type { createPostResponse } from "@/features/post/types"
import type { isPostLikedByUserRequest, isPostLikedByUserResposne } from "@/features/post/types";
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
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    createPost: builder.mutation<createPostResponse, FormData>({
      query: (post) => ({
        url: `/api/post/create-post`,
        method: "POST",
        body: post
      }),
      invalidatesTags: (result) => {
        if (!result) return [];
        return [{ type: "Post", id: `HOME-FEED` }, { type: "Post", id: `PROFILE-FEED-${result.post.authorId}` }]
      }
    }),
    likePost: builder.mutation<any, Post>({
      query: (targetPost) => ({
        url: `/api/post/like-post/${targetPost._id}`,
        method: "POST",
      }),

      async onQueryStarted(targetPost, { dispatch, queryFulfilled, getState }) {
        const patchPosts = dispatch(
          postApi.util.updateQueryData(
            "getPosts",
            undefined,
            (draft) => {
              draft.pages.forEach((page) => {
                const post = page.posts.find(p => p._id === targetPost?._id);
                if (post) {
                  post.likesCount = (post.likesCount ?? 0) + 1;
                }
              });
            }
          )
        );
        const patchPostsByUser = dispatch(
          postApi.util.updateQueryData(
            "getPostsByUser",
            targetPost.authorId,
            (draft) => {
              draft.pages.forEach((page) => {
                const post = page.posts.find(p => p._id === targetPost._id);
                if (post) {
                  post.likesCount = (post.likesCount ?? 0) + 1;
                }
              });
            }
          )
        );

        const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, { subscribe: false }));
        let patchIsLiked;
        const userId = user.data?.id
        const postId = targetPost._id
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
          patchPostsByUser.undo();
          if (patchIsLiked) patchIsLiked.undo();
        }
      },
    }),
    unlikePost: builder.mutation<string, Post>({
      query: (targetPost) => ({
        url: `/api/post/unlike-post/${targetPost._id}`,
        method: "DELETE",
      }),
      async onQueryStarted(targetPost, { dispatch, queryFulfilled, getState }) {
        const patchPosts = dispatch(
          postApi.util.updateQueryData(
            "getPosts",
            undefined,
            (draft) => {
              draft.pages.forEach((page) => {
                const post = page.posts.find(p => p._id === targetPost?._id);
                if (post) {
                  post.likesCount = (post.likesCount ?? 0) - 1;
                }
              });
            }
          )
        );
        const patchPostsByUser = dispatch(
          postApi.util.updateQueryData(
            "getPostsByUser",
            targetPost.authorId,
            (draft) => {
              draft.pages.forEach((page) => {
                const post = page.posts.find(p => p._id === targetPost._id);
                if (post) {
                  post.likesCount = (post.likesCount ?? 0) - 1;
                }
              });
            }
          )
        );

        const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, { subscribe: false }));
        let patchIsLiked;
        const userId = user.data?.id
        const postId = targetPost._id
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
          patchPostsByUser.undo();
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
    deletePost: builder.mutation<{ message: string }, Post>({
      query: (post) => ({
        url: `/api/post/delete-post/${post._id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, post) => {
        if (!result) return [];
        return [{ type: "Post", id: `HOME-FEED` }, { type: "Post", id: `PROFILE-FEED-${post.authorId}` }]
      }
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
      providesTags: (result) =>
        result
          ? [
            ...result.pages.flatMap(page =>
              page.posts.map(({ _id }) => ({
                type: 'Post' as const,
                id: `HOME-FEED-${_id}`
              }))
            ),
            { type: 'Post', id: 'HOME-FEED' },
          ]
          : [{ type: 'Post', id: 'HOME-FEED' }],
    }),
    getPostsByUser: builder.infiniteQuery<getPostResponse, string, string | null>({
      infiniteQueryOptions: {
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
          if (lastPage.cursor?._id) return lastPage.cursor._id;
          return undefined;
        }
      },
      query({ queryArg: userId, pageParam }) {
        return `/api/post/get-posts-by-user/${userId}?${pageParam ? `cursor=${pageParam}&` : ""}limit=3`
      },
      providesTags: (result, error, userId) =>
        result
          ? [
            ...result.pages.flatMap(page =>
              page.posts.map(({ _id }) => ({
                type: 'Post' as const,
                id: `PROFILE-FEED-${userId}-${_id}`,
              }))
            ),
            { type: 'Post', id: `PROFILE-FEED-${userId}` },
          ]
          : [{ type: 'Post', id: `PROFILE-FEED-${userId}` }],
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