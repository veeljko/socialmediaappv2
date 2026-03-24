import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { authApi } from "./authApi";
import type { AuthResponse } from "@/features/auth/types";
import type { GetFollowersResponse, GetFollowingsResponse, IsFollowing, FollowUserResponse } from "@/features/follower/types";

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
    tagTypes: ["Follower"],
    endpoints: (builder) => ({
        followUser: builder.mutation<FollowUserResponse, string>({
            query: (userId) => ({
                url: `/api/follower/follow/${userId}`,
                method: "POST",
            }),
            async onQueryStarted(userId, { dispatch, queryFulfilled }) {
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
                const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, {subscribe : false}));
                const authUserId = user.data?.id
                const patchFollowingCountForAuthUser = dispatch(
                    authApi.util.updateQueryData("getUserInfo", authUserId || "", (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followingCount = (draft.user?.followingCount ?? 0) + 1;
                    })
                );

                try {
                    await queryFulfilled;
                    dispatch(followApi.util.invalidateTags([
                        { type: "Follower", id: `FOLLOWERS-${userId}` },
                        { type: "Follower", id: `FOLLOWINGS-${authUserId}` }
                    ]));
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
            async onQueryStarted(userId, { dispatch, queryFulfilled }) {
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
                const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, {subscribe : false}));
                const authUserId = user.data?.id
                const patchFollowingCountForAuthUser = dispatch(
                    authApi.util.updateQueryData("getUserInfo", authUserId || "", (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followingCount = (draft.user?.followingCount ?? 0) - 1;
                    })
                );

                try {
                    await queryFulfilled;
                    dispatch(followApi.util.invalidateTags([
                        { type: "Follower", id: `FOLLOWERS-${userId}` },
                        { type: "Follower", id: `FOLLOWINGS-${authUserId}` }
                    ]));
                } catch {
                    patchFollowingInfo.undo();
                    patchFollowingCount.undo();
                    patchFollowingCountForAuthUser.undo();
                }
            },
        }),
        removeFollower: builder.mutation<FollowUserResponse, string>({
            query: (userId) => ({
                url: `/api/follower/remove-follower/${userId}`,
                method: "POST",
            }),
            async onQueryStarted(userId, { dispatch, queryFulfilled }) {
                const user = await dispatch(authApi.endpoints.getAuthedUserInfo.initiate(undefined, { subscribe: false }));
                const authUserId = user.data?.id;

                const patchFollowersCountForAuthUser = dispatch(
                    authApi.util.updateQueryData("getUserInfo", authUserId || "", (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followersCount = Math.max(0, (draft.user?.followersCount ?? 0) - 1);
                    })
                );
                const patchFollowingCountForRemovedFollower = dispatch(
                    authApi.util.updateQueryData("getUserInfo", userId, (draft: AuthResponse) => {
                        if (!draft.user) return;
                        draft.user.followingCount = Math.max(0, (draft.user?.followingCount ?? 0) - 1);
                    })
                );

                try {
                    await queryFulfilled;
                    dispatch(followApi.util.invalidateTags([
                        { type: "Follower", id: `FOLLOWERS-${authUserId}` },
                        { type: "Follower", id: `FOLLOWINGS-${userId}` }
                    ]));
                } catch {
                    patchFollowersCountForAuthUser.undo();
                    patchFollowingCountForRemovedFollower.undo();
                }
            },
        }),
        getFollowers: builder.infiniteQuery<GetFollowersResponse, string, string | null>({
            infiniteQueryOptions: {
                initialPageParam: "",
                getNextPageParam: (lastPage) => {
                    if (!lastPage.cursor) return undefined;
                    if (typeof lastPage.cursor === "string") return lastPage.cursor;
                    return lastPage.cursor._id;
                }
            },
            query({ queryArg: userId, pageParam }) {
                return `/api/follower/get-followers/${userId}?${pageParam ? `cursor=${pageParam}&` : ""}limit=5`
            },
            providesTags: (result, _error, userId) =>
                result
                    ? [
                        ...result.pages.flatMap(page =>
                            page.followers.map(({ _id }) => ({
                                type: "Follower" as const,
                                id: `FOLLOWERS-${userId}-${_id}`
                            }))
                        ),
                        { type: "Follower", id: `FOLLOWERS-${userId}` }
                    ]
                    : [{ type: "Follower", id: `FOLLOWERS-${userId}` }]
        }),
        getFollowings: builder.infiniteQuery<GetFollowingsResponse, string, string | null>({
            infiniteQueryOptions: {
                initialPageParam: "",
                getNextPageParam: (lastPage) => {
                    if (!lastPage.cursor) return undefined;
                    if (typeof lastPage.cursor === "string") return lastPage.cursor;
                    return lastPage.cursor._id;
                }
            },
            query({ queryArg: userId, pageParam }) {
                return `/api/follower/get-followings/${userId}?${pageParam ? `cursor=${pageParam}&` : ""}limit=5`
            },
            providesTags: (result, _error, userId) =>
                result
                    ? [
                        ...result.pages.flatMap(page =>
                            page.followings.map(({ _id }) => ({
                                type: "Follower" as const,
                                id: `FOLLOWINGS-${userId}-${_id}`
                            }))
                        ),
                        { type: "Follower", id: `FOLLOWINGS-${userId}` }
                    ]
                    : [{ type: "Follower", id: `FOLLOWINGS-${userId}` }]
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
    useRemoveFollowerMutation,
    useGetFollowersInfiniteQuery,
    useGetFollowingsInfiniteQuery,
    useIsFollowingQuery,
} = followApi;
