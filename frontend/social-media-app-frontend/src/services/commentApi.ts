import type {
  CommentCard,
  createCommentRequest,
  createCommentResponse,
  createCommentToCommentRequest,
  createCommentToCommentResponse,
  getCommentByIdResponse,
  getCommentsFromCommentResponse,
  getCommentsFromPostResponse,
  isCommentLikedByUserRequest,
  isCommentLikedByUserResponse,
} from "@/features/comment/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { authApi } from "./authApi";
import { postApi } from "./postApi";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000",
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
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
    createComment: builder.mutation<createCommentResponse, createCommentRequest>({
      query: ({ postId, formData }) => ({
        url: `/api/comment/add-comment-to-post/${postId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, _error, { postId }) => {
        if (!result) return [];
        return [{ type: "Comment", id: `POST-COMMENTS-${postId}` }];
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patchPostInfo = dispatch(
          postApi.util.updateQueryData("getPostInfo", postId, (draft) => {
            draft.commentsCount = (draft.commentsCount ?? 0) + 1;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchPostInfo.undo();
        }
      },
    }),
    createCommentToComment: builder.mutation<
      createCommentToCommentResponse,
      createCommentToCommentRequest
    >({
      query: ({ commentId, formData }) => ({
        url: `/api/comment/add-comment-to-comment/${commentId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, _error, { commentId }) => {
        if (!result) return [];
        return [{ type: "Comment", id: `COMMENT-${commentId}` }];
      },
    }),
    getCommentsFromPost: builder.infiniteQuery<
      getCommentsFromPostResponse,
      string,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
          if (lastPage.cursor?._id) return lastPage.cursor._id;
          return undefined;
        },
      },
      query({ queryArg: postId, pageParam }) {
        return `/api/comment/get-comments-from-post/${postId}/?${pageParam ? `cursor=${pageParam}&` : ""
          }limit=3`;
      },
      providesTags: (result, _error, postId) =>
        result
          ? [
            ...result.pages.flatMap((page) =>
              page.comments.map(({ _id }) => ({
                type: "Comment" as const,
                id: `COMMENT-${_id}`,
              }))
            ),
            { type: "Comment", id: `POST-COMMENTS-${postId}` },
          ]
          : [{ type: "Comment", id: `POST-COMMENTS-${postId}` }],
    }),
    likeComment: builder.mutation<{ message: string }, CommentCard>({
      query: (targetComment) => ({
        url: `/api/comment/like-comment/${targetComment._id}`,
        method: "POST",
      }),
      async onQueryStarted(targetComment, { dispatch, queryFulfilled }) {
        const patchComments = dispatch(
          commentApi.util.updateQueryData(
            "getCommentsFromPost",
            targetComment.postId,
            (draft) => {
              draft.pages.forEach((page) => {
                const comment = page.comments.find(
                  (currentComment) => currentComment._id === targetComment._id
                );

                if (comment) {
                  comment.likesCount = (comment.likesCount ?? 0) + 1;
                }
              });
            }
          )
        );

        const user = await dispatch(
          authApi.endpoints.getAuthedUserInfo.initiate(undefined, {
            subscribe: false,
          })
        );

        let patchIsLiked:
          | {
            undo: () => void;
          }
          | undefined;

        const userId = user.data?.id;
        const commentId = targetComment._id;

        if (userId) {
          patchIsLiked = dispatch(
            commentApi.util.updateQueryData(
              "isCommentLikedByUser",
              { commentId, userId },
              (draft: isCommentLikedByUserResponse) => {
                draft.answer = true;
              }
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchComments.undo();
          patchIsLiked?.undo();
        }
      },
    }),
    unlikeComment: builder.mutation<{ message: string }, CommentCard>({
      query: (targetComment) => ({
        url: `/api/comment/unlike-comment/${targetComment._id}`,
        method: "POST",
      }),
      async onQueryStarted(targetComment, { dispatch, queryFulfilled }) {
        const patchComments = dispatch(
          commentApi.util.updateQueryData(
            "getCommentsFromPost",
            targetComment.postId,
            (draft) => {
              draft.pages.forEach((page) => {
                const comment = page.comments.find(
                  (currentComment) => currentComment._id === targetComment._id
                );

                if (comment) {
                  comment.likesCount = (comment.likesCount ?? 0) - 1;
                }
              });
            }
          )
        );

        const user = await dispatch(
          authApi.endpoints.getAuthedUserInfo.initiate(undefined, {
            subscribe: false,
          })
        );

        let patchIsLiked:
          | {
            undo: () => void;
          }
          | undefined;

        const userId = user.data?.id;
        const commentId = targetComment._id;

        if (userId) {
          patchIsLiked = dispatch(
            commentApi.util.updateQueryData(
              "isCommentLikedByUser",
              { commentId, userId },
              (draft: isCommentLikedByUserResponse) => {
                draft.answer = false;
              }
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchComments.undo();
          patchIsLiked?.undo();
        }
      },
    }),
    isCommentLikedByUser: builder.query<
      isCommentLikedByUserResponse,
      isCommentLikedByUserRequest
    >({
      query: ({ commentId, userId }) => ({
        url: `/api/comment/${commentId}/is-liked-by/${userId}`,
        method: "GET",
      }),
    }),
    getCommentById: builder.query<CommentCard, string>({
      query: (commentId) => ({
        url: `/api/comment/get-comment-by-id/${commentId}`,
        method: "GET",
      }),
      transformResponse: (response: getCommentByIdResponse) => response.comment,
      providesTags: (result, _error, commentId) =>
        result ? [{ type: "Comment", id: `COMMENT-${commentId}` }] : [],
    }),
    deleteComment: builder.mutation<{ message: string }, CommentCard>({
      query: (targetComment) => ({
        url: `/api/comment/delete-comment/${targetComment._id}`,
        method: "DELETE",
      }),
      async onQueryStarted(targetComment, { dispatch, queryFulfilled }) {
        const patchComments = dispatch(
          commentApi.util.updateQueryData(
            "getCommentsFromPost",
            targetComment.postId,
            (draft) => {
              draft.pages.forEach((page) => {
                page.comments = page.comments.filter(
                  (comment) => comment._id !== targetComment._id
                );
              });
            }
          )
        );

        const patchPostInfo = dispatch(
          postApi.util.updateQueryData(
            "getPostInfo",
            targetComment.postId,
            (draft) => {
              draft.commentsCount = Math.max(
                0,
                (draft.commentsCount ?? 0) - 1
              );
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchComments.undo();
          patchPostInfo.undo();
        }
      },
      invalidatesTags: (_result, _error, targetComment) => [
        { type: "Comment", id: `COMMENT-${targetComment._id}` },
        { type: "Comment", id: `POST-COMMENTS-${targetComment.postId}` },
      ],
    }),
    getCommentsFromComment: builder.infiniteQuery<
      getCommentsFromCommentResponse,
      string,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: "",
        getNextPageParam: (lastPage) => {
          if (lastPage.cursor?._id) return lastPage.cursor._id;
          return undefined;
        },
      },
      query({ queryArg: commentId, pageParam }) {
        return `/api/comment/get-comments-from-comment/${commentId}/?${
          pageParam ? `cursor=${pageParam}&` : ""
        }limit=3`;
      },
      providesTags: (result, _error, commentId) =>
        result
          ? [
              ...result.pages.flatMap((page) =>
                page.comments.map(({ _id }) => ({
                  type: "Comment" as const,
                  id: `COMMENT-${_id}`,
                }))
              ),
              { type: "Comment", id: `COMMENT-${commentId}` },
            ]
          : [{ type: "Comment", id: `COMMENT-${commentId}` }],
    }),
    updateComment: builder.mutation<
      { message: string },
      { commentId: string; formData: FormData }
    >({
      query: ({ commentId, formData }) => ({
        url: `/api/comment/update-comment/${commentId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, _error, { commentId }) => {
        if (!result) return [];
        return [{ type: "Comment", id: `COMMENT-${commentId}` }];
      },
    }),

  }),
});

export const {
  useCreateCommentMutation,
  useCreateCommentToCommentMutation,
  useDeleteCommentMutation,
  useGetCommentByIdQuery,
  useGetCommentsFromCommentInfiniteQuery,
  useGetCommentsFromPostInfiniteQuery,
  useIsCommentLikedByUserQuery,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} = commentApi;
