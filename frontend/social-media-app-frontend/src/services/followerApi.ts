import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { authApi } from "./authApi";
import type { AuthResponse, User } from "@/features/auth/types";
import { setPosts } from "@/features/post/postSlice";
import type { Post } from "@/features/post/types";
import { setUser } from "@/features/auth/authSlice";

interface FollowUserResponse {
    message: string
}
interface IsFollowing {
    message: string,
    answer: boolean
}

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

export const followApi = createApi({
    reducerPath: "followerApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        followUser: builder.mutation<FollowUserResponse, string>({
            query: (userId) => ({
                url: `/api/follower/follow/${userId}`,
                method: "POST",
            }),
            async onQueryStarted(userId, { dispatch, queryFulfilled, getState }) {
                const patchFollowingInfo = dispatch(
                    followApi.util.updateQueryData("isFollowing", userId, (draft: IsFollowing) => {
                        draft.answer = !draft.answer;
                    })
                );
                const patchFollowingCount = dispatch(
                    authApi.util.updateQueryData("getUserInfo", userId, (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followersCount = (draft.user?.followersCount ?? 0) + 1;
                    })
                );
                const authUserId = (getState() as any).auth.user?.id;
                const patchFollowingCountForAuthUser = dispatch(
                    authApi.util.updateQueryData("getUserInfo", authUserId, (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followingCount = (draft.user?.followingCount ?? 0) + 1;
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchFollowingInfo.undo();
                    patchFollowingCount.undo();
                    patchFollowingCountForAuthUser.undo();
                }
            },
        }),
        unFollowUser: builder.mutation<FollowUserResponse, string>({
            query: (userId) => ({
                url: `/api/follower/unfollow/${userId}`,
                method: "POST",
            }),
            async onQueryStarted(userId, { dispatch, queryFulfilled, getState }) {
                const patchFollowingInfo = dispatch(
                    followApi.util.updateQueryData("isFollowing", userId, (draft: IsFollowing) => {
                        draft.answer = !draft.answer;
                    })
                );
                const patchFollowingCount = dispatch(
                    authApi.util.updateQueryData("getUserInfo", userId, (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followersCount = (draft.user?.followersCount ?? 0) - 1;
                    })
                );
                const authUserId = (getState() as any).auth.user?.id;
                const patchFollowingCountForAuthUser = dispatch(
                    authApi.util.updateQueryData("getUserInfo", authUserId, (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followingCount = (draft.user?.followingCount ?? 0) - 1;
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchFollowingInfo.undo();
                    patchFollowingCount.undo();
                    patchFollowingCountForAuthUser.undo();
                }
            },
        }),
        isFollowing: builder.query<IsFollowing, string>({
            query: (userId) => ({
                url: `/api/follower/follows/${userId}`,
                method: "GET",
            })
        })
    }),
});

export const {
    useFollowUserMutation,
    useUnFollowUserMutation,
    useIsFollowingQuery,
} = followApi;