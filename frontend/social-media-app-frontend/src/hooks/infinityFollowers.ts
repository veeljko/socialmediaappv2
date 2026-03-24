import type { FollowerRelation } from "@/features/follower/types";
import { useGetFollowersInfiniteQuery } from "@/services/followerApi";
import { useInfiniteScroll } from "./infiniteScroll";

export const useInfinityFollowers = ({ profileId }: { profileId: string | undefined }) => {
    const {data : followers, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetFollowersInfiniteQuery(profileId || "", {
        skip: !profileId
    });
    const loadMoreRef = useInfiniteScroll(async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
        }
    });

    const allResults = followers?.pages;
    const allFollowers: FollowerRelation[] | undefined = allResults?.flatMap(result => result.followers);

    
    return {allFollowers, loadMoreRef};
}
