import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { FeedCursor, getFeedResponse } from "@/features/post/types";

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

export const feedApi = createApi({
  reducerPath: "feedApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Feed"],
  endpoints: (builder) => ({
    getFollowingFeed: builder.infiniteQuery<getFeedResponse, void, FeedCursor | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
          if (lastPage.cursor) return lastPage.cursor;
          return undefined;
        }
      },
      query({ pageParam }) {
        const searchParams = new URLSearchParams({
          limit: "3",
        });

        if (pageParam) {
          searchParams.set("cursorCreatedAt", pageParam.createdAt);
          searchParams.set("cursorId", pageParam.id);
        }

        return `/api/feed/get-feed?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.pages.flatMap(page =>
              page.posts.map(({ _id }) => ({
                type: "Feed" as const,
                id: `FOLLOWING-FEED-${_id}`,
              }))
            ),
            { type: "Feed", id: "FOLLOWING-FEED" },
          ]
          : [{ type: "Feed", id: "FOLLOWING-FEED" }],
    }),
  }),
});

export const {
  useGetFollowingFeedInfiniteQuery,
} = feedApi;
