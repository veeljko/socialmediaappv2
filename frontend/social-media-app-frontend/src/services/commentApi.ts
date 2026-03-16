import type { CommentCard, getCommentsFromPostRequest, getCommentsFromPostResponse, isCommentLikedByUserRequest, isCommentLikedByUserResponse } from "@/features/comment/types";
import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { postApi } from "./postApi";
import { authApi } from "./authApi";
import type { use } from "react";


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

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    getCommentsFromPost: builder.infiniteQuery<getCommentsFromPostResponse, string, string | null>({
      infiniteQueryOptions: {
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
          if (lastPage.cursor?._id) return lastPage.cursor._id;
          return undefined;
        }
      },
      query({ queryArg: postId, pageParam }) {
        return `/api/comment/get-comments-from-post/${postId}/?${pageParam ? `cursor=${pageParam}&` : ""}limit=3`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.pages.flatMap(page =>
              page.comments.map(({ _id }) => ({
                type: 'Comment' as const,
                id: `TARGET-POST-${_id}`
              }))
            )
          ]
          : [{ type: 'Comment', id: 'HOME-FEED' }],
    }),
    likeComment: builder.mutation<any, CommentCard>({
      query: (targetComment) => ({
        url: `/api/comment/like-comment/${targetComment._id}`,
        method: "POST",
      }),

      async onQueryStarted(targetComment, { dispatch, queryFulfilled, getState }) {
        const patchComments = dispatch(
          commentApi.util.updateQueryData(
            "getCommentsFromPost",
            targetComment.postId,
            (draft) => {
              draft.pages.forEach((page) => {
                const comment = page.comments.find(p => p._id === targetComment._id);
                if (comment) {
                  comment.likesCount = (comment.likesCount ?? 0) + 1;
                }
              });
            }
          )
        );

        const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, { subscribe: false }));
        let patchIsLiked;
        const userId = user.data?.id
        const commentId = targetComment._id;
        if (userId) {
          patchIsLiked = dispatch(
            commentApi.util.updateQueryData(
              "isCommentLikedByUser",
              { commentId, userId },
              (draft: any) => {
                draft.answer = true;
              }
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchComments.undo();
          if (patchIsLiked) patchIsLiked.undo();
        }
      },
    }),
    unlikeComment: builder.mutation<any, CommentCard>({
      query: (targetComment) => ({
        url: `/api/comment/unlike-comment/${targetComment._id}`,
        method: "POST",
      }),

      async onQueryStarted(targetComment, { dispatch, queryFulfilled, getState }) {
        const patchComments = dispatch(
          commentApi.util.updateQueryData(
            "getCommentsFromPost",
            targetComment.postId,
            (draft) => {
              draft.pages.forEach((page) => {
                const comment = page.comments.find(p => p._id === targetComment._id);
                if (comment) {
                  comment.likesCount = (comment.likesCount ?? 0) - 1;
                }
              });
            }
          )
        );

        const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, { subscribe: false }));
        let patchIsLiked;
        const userId = user.data?.id
        const commentId = targetComment._id;
        if (userId) {
          patchIsLiked = dispatch(
            commentApi.util.updateQueryData(
              "isCommentLikedByUser",
              { commentId, userId },
              (draft: any) => {
                draft.answer = false;
              }
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchComments.undo();
          if (patchIsLiked) patchIsLiked.undo();
        }
      },
    }),
    isCommentLikedByUser: builder.query<isCommentLikedByUserResponse, isCommentLikedByUserRequest>({
      query: ({ commentId, userId }) => ({
        url: `/api/comment/${commentId}/is-liked-by/${userId}`,
        method: "GET",
      })
    }),

  }),
});

export const {
  useGetCommentsFromPostInfiniteQuery,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useIsCommentLikedByUserQuery
} = commentApi;