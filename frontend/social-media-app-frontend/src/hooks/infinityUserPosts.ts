import type { Post } from "@/features/post/types";
import { useGetPostsByUserInfiniteQuery } from "@/services/postApi";
import { useInfiniteScroll } from "./infiniteScroll";

export const useInfinityUserPosts = ({profileId} : {profileId : string | undefined}) => {
    const {data : posts, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetPostsByUserInfiniteQuery(profileId || "", {skip: !profileId});
    const loadMoreRef = useInfiniteScroll(async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
        }
    });

    const allResults = posts?.pages;
    const allPosts: Post[] | undefined = allResults?.flatMap(result => result.posts);

    return {allPosts, loadMoreRef};
}
