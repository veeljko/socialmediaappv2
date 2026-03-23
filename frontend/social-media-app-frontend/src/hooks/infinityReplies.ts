import { useGetCommentsFromCommentInfiniteQuery } from "@/services/commentApi";
import type { CommentCard } from "@/features/comment/types";
import { useState } from "react";

export const useInfinityReplies = ({ comment }: { comment: CommentCard }) => {
  const {
    data: replies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCommentsFromCommentInfiniteQuery(comment._id, {
    skip: !comment._id,
  });
  const [loadedComments, setLoadedComments] = useState(3);
  const loadMoreComments = (async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
      setLoadedComments((prev) => prev + 3);
    }
  });

  const allResults = replies?.pages;
  const allReplies = allResults
    ?.flatMap((result) => result.comments)
    .reduce<CommentCard[]>((uniqueReplies, reply) => {
      if (uniqueReplies.some((currentReply) => currentReply._id === reply._id)) {
        return uniqueReplies;
      }

      uniqueReplies.push(reply);
      return uniqueReplies;
    }, [])
    .sort(
      (firstReply, secondReply) =>
        new Date(firstReply.createdAt).getTime() -
        new Date(secondReply.createdAt).getTime()
    );

  const hasMoreReplies = (allReplies?.length ?? 0) < (comment.repliesCount ?? 0);

  return {
    allReplies,
    loadMoreComments,
    loadedComments,
    hasNextPage: hasMoreReplies,
  };
}
