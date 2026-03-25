
import { useGetLikesFromPostInfiniteQuery } from "@/services/postApi";
import { useInfiniteScroll } from "./infiniteScroll";

export const useInfinityLikes = ({ postId }: { postId: string | undefined }) => {
  const { data: likes, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetLikesFromPostInfiniteQuery(postId || "", {
    skip: !postId
  });
  const loadMoreRef = useInfiniteScroll(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  });

  const allResults = likes?.pages;
  const allLikes = allResults?.flatMap(result => result.likes);


  return { allLikes, loadMoreRef };
}
