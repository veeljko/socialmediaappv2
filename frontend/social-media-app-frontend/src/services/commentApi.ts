import type {
  CommentCard,
  createCommentRequest,
  createCommentResponse,
  createCommentToCommentRequest,
  createCommentToCommentResponse,
  deleteCommentResponse,
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

const patchPostCommentCount = ({
  dispatch,
  getState,
  postId,
  delta,
}: {
  dispatch: any;
  getState: () => unknown;
  postId: string;
  delta: number;
}) => {
  const patches = [
    dispatch(
      postApi.util.updateQueryData("getPostInfo", postId, (draft) => {
        draft.commentsCount = Math.max(0, (draft.commentsCount ?? 0) + delta);
      })
    ),
    dispatch(
      postApi.util.updateQueryData("getPosts", undefined, (draft) => {
        draft.pages.forEach((page) => {
          const post = page.posts.find((currentPost) => currentPost._id === postId);

          if (post) {
            post.commentsCount = Math.max(0, (post.commentsCount ?? 0) + delta);
          }
        });
      })
    ),
  ];

  const cachedPostInfo = postApi.endpoints.getPostInfo.select(postId)(
    getState() as any
  ).data;

  if (cachedPostInfo?.authorId) {
    patches.push(
      dispatch(
        postApi.util.updateQueryData(
          "getPostsByUser",
          cachedPostInfo.authorId,
          (draft) => {
            draft.pages.forEach((page) => {
              const post = page.posts.find(
                (currentPost) => currentPost._id === postId
              );

              if (post) {
                post.commentsCount = Math.max(
                  0,
                  (post.commentsCount ?? 0) + delta
                );
              }
            });
          }
        )
      )
    );
  }

  return patches;
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
      async onQueryStarted({ postId }, { dispatch, queryFulfilled, getState }) {
        const postCountPatches = patchPostCommentCount({
          dispatch,
          getState,
          postId,
          delta: 1,
        });

        try {
          const { data } = await queryFulfilled;
          dispatch(
            commentApi.util.updateQueryData(
              "getCommentsFromPost",
              postId,
              (draft) => {
                if (!draft.pages.length) return;

                const alreadyExists = draft.pages.some((page) =>
                  page.comments.some((comment) => comment._id === data.comment._id)
                );

                if (alreadyExists) return;

                const lastPage = draft.pages[draft.pages.length - 1];
                lastPage.comments.push(data.comment);
              }
            )
          );
        } catch {
          postCountPatches.forEach((patch) => patch.undo());
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
      async onQueryStarted({ commentId }, { dispatch, queryFulfilled, getState }) {
        const targetCommentResult = await dispatch(
          commentApi.endpoints.getCommentById.initiate(commentId, {
            subscribe: false,
          })
        );

        const targetComment = targetCommentResult.data;
        if (!targetComment) {
          await queryFulfilled;
          return;
        }

        const rootCommentId = targetComment.rootId ?? targetComment._id;
        const patchRootInPostComments = dispatch(
          commentApi.util.updateQueryData(
            "getCommentsFromPost",
            targetComment.postId,
            (draft) => {
              draft.pages.forEach((page) => {
                const rootComment = page.comments.find(
                  (comment) => comment._id === rootCommentId
                );

                if (rootComment) {
                  rootComment.repliesCount =
                    (rootComment.repliesCount ?? 0) + 1;
                }
              });
            }
          )
        );

        const patchRootComment = dispatch(
          commentApi.util.updateQueryData(
            "getCommentById",
            rootCommentId,
            (draft) => {
              draft.repliesCount = (draft.repliesCount ?? 0) + 1;
            }
          )
        );

        const postCountPatches = patchPostCommentCount({
          dispatch,
          getState,
          postId: targetComment.postId,
          delta: 1,
        });

        try {
          const { data } = await queryFulfilled;
          dispatch(
            commentApi.util.updateQueryData(
              "getCommentsFromComment",
              rootCommentId,
              (draft) => {
                if (!draft.pages.length) return;

                const lastPage = draft.pages[draft.pages.length - 1];
                const alreadyExists = draft.pages.some((page) =>
                  page.comments.some(
                    (comment) => comment._id === data.comment._id
                  )
                );

                if (alreadyExists) return;

                lastPage.comments.push(data.comment);
              }
            )
          );
        } catch {
          patchRootInPostComments.undo();
          patchRootComment.undo();
          postCountPatches.forEach((patch) => patch.undo());
        }
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

        const patchCommentById = dispatch(
          commentApi.util.updateQueryData(
            "getCommentById",
            targetComment._id,
            (draft) => {
              draft.likesCount = (draft.likesCount ?? 0) + 1;
            }
          )
        );

        let patchReplies:
          | {
              undo: () => void;
            }
          | undefined;

        if (targetComment.rootId) {
          patchReplies = dispatch(
            commentApi.util.updateQueryData(
              "getCommentsFromComment",
              targetComment.rootId,
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
        }

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
          patchCommentById.undo();
          patchReplies?.undo();
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

        const patchCommentById = dispatch(
          commentApi.util.updateQueryData(
            "getCommentById",
            targetComment._id,
            (draft) => {
              draft.likesCount = Math.max(0, (draft.likesCount ?? 0) - 1);
            }
          )
        );

        let patchReplies:
          | {
              undo: () => void;
            }
          | undefined;

        if (targetComment.rootId) {
          patchReplies = dispatch(
            commentApi.util.updateQueryData(
              "getCommentsFromComment",
              targetComment.rootId,
              (draft) => {
                draft.pages.forEach((page) => {
                  const comment = page.comments.find(
                    (currentComment) => currentComment._id === targetComment._id
                  );

                  if (comment) {
                    comment.likesCount = Math.max(
                      0,
                      (comment.likesCount ?? 0) - 1
                    );
                  }
                });
              }
            )
          );
        }

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
          patchCommentById.undo();
          patchReplies?.undo();
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
    deleteComment: builder.mutation<deleteCommentResponse, CommentCard>({
      query: (targetComment) => ({
        url: `/api/comment/delete-comment/${targetComment._id}`,
        method: "DELETE",
      }),
      async onQueryStarted(targetComment, { dispatch, queryFulfilled }) {
        const markCommentAsDeleted = (draft: CommentCard) => {
          draft.isDeleted = true;
          draft.content = "";
          draft.likesCount = 0;
          draft.mediaUrl = null;
        };

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
                  markCommentAsDeleted(comment);
                }
              });
            }
          )
        );

        const patchCommentById = dispatch(
          commentApi.util.updateQueryData(
            "getCommentById",
            targetComment._id,
            (draft) => {
              markCommentAsDeleted(draft);
            }
          )
        );

        let patchReplies:
          | {
              undo: () => void;
            }
          | undefined;

        if (targetComment.rootId) {
          patchReplies = dispatch(
            commentApi.util.updateQueryData(
              "getCommentsFromComment",
              targetComment.rootId,
              (draft) => {
                draft.pages.forEach((page) => {
                  const comment = page.comments.find(
                    (currentComment) => currentComment._id === targetComment._id
                  );

                  if (comment) {
                    markCommentAsDeleted(comment);
                  }
                });
              }
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patchComments.undo();
          patchCommentById.undo();
          patchReplies?.undo();
        }
      },
      invalidatesTags: (_result, _error, targetComment) => [
        { type: "Comment", id: `COMMENT-${targetComment._id}` },
        { type: "Comment", id: `POST-COMMENTS-${targetComment.postId}` },
        ...(targetComment.rootId
          ? [{ type: "Comment" as const, id: `COMMENT-${targetComment.rootId}` }]
          : []),
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
      { message: string; comment: CommentCard },
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
  useUpdateCommentMutation,
} = commentApi;
