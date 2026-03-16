import { useGetCommentsFromCommentInfiniteQuery } from "@/services/commentApi";
import type { CommentCard } from "@/features/comment/types";
import { useState } from "react";

export const useInfinityReplies = ({ comment }: { comment: CommentCard }) => {
  const { data: replies, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetCommentsFromCommentInfiniteQuery(comment._id, { skip: !comment._id });
  const [loadedComments, setLoadedComments] = useState(3);
  const loadMoreComments = (async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
      setLoadedComments((prev) => prev + 3);
    }
  });

  const allResults = replies?.pages;
  const allReplies: CommentCard[] | undefined = allResults?.flatMap(result => result.comments);

  return { allReplies, loadMoreComments, loadedComments };
}