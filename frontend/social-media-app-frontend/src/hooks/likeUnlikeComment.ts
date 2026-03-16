import type { CommentCard } from "@/features/comment/types";
import { useIsCommentLikedByUserQuery, useLikeCommentMutation, useUnlikeCommentMutation } from "@/services/commentApi";
  

export const useLikeUnlikeComment = ({ userId, comment }: { userId: string | undefined, comment: CommentCard | undefined }) => {
  const { data: isLiked, isLoading: isLikedLoading } = useIsCommentLikedByUserQuery({ userId: userId || "", commentId: comment?._id || "" }, { skip: !userId || !comment });
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();

  const handleLike = async () => {
    if (!comment) return;
    if (!isLiked?.answer) await likeComment(comment);
    else await unlikeComment(comment);
  }

  return { handleLike, isLiked, isLikedLoading };
}