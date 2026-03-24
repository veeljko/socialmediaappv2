import type { FollowerRelation } from "@/features/follower/types";
import { useGetFollowingsInfiniteQuery } from "@/services/followerApi";
import { useInfiniteScroll } from "./infiniteScroll";

export const useInfinityFollowings = ({ profileId }: { profileId: string | undefined }) => {
    const {data : followings, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetFollowingsInfiniteQuery(profileId || "", {
        skip: !profileId
    });
    const loadMoreRef = useInfiniteScroll(async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
        }
    });

    const allResults = followings?.pages;
    const allFollowings: FollowerRelation[] | undefined = allResults?.flatMap(result => result.followings);

    
    return {allFollowings, loadMoreRef};
}
