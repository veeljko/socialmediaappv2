import type { Post } from "@/features/post/types";
import { useGetFollowingFeedInfiniteQuery } from "@/services/postApi";
import { useInfiniteScroll } from "./infiniteScroll";

export const useInfinityFollowingFeed = (enabled: boolean = true) => {
    const {
        data: feed,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useGetFollowingFeedInfiniteQuery(undefined, {
        skip: !enabled,
    });

    const loadMoreRef = useInfiniteScroll(async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
        }
    });

    const allResults = feed?.pages;
    const allPosts: Post[] | undefined = allResults?.flatMap((result) => result.posts);

    return { allPosts, loadMoreRef };
};
