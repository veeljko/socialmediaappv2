import type { Post } from "@/features/post/types";
import { useGetPostsInfiniteQuery } from "@/services/postApi";
import { useInfiniteScroll } from "./infiniteScroll";

export const useInfinityPosts = () => {
    const {data : posts, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetPostsInfiniteQuery(undefined);
    const loadMoreRef = useInfiniteScroll(async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
        }
    });

    const allResults = posts?.pages;
    const allPosts: Post[] | undefined = allResults?.flatMap(result => result.posts);

    
    return {allPosts, loadMoreRef};
}