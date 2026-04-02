import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import type { CommentCard } from "../../features/comment/types";
import { Heart } from "lucide-react";
import { UserAvatar } from "../Profile/UserAvatar";
import CommentContent from "./CommentContent";
import { useLikeUnlikeComment } from "@/hooks/likeUnlikeComment";
import { useState } from "react";
import { useInfinityReplies } from "@/hooks/infinityReplies";
import { ReplayDisplay } from "../ReplyDisplay";
import CommentInput from "./CommentInput";
import { EditCommentButton } from "./EditCommentButton";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function formatDate(createdAt: string) {
  const difference = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days} days ago` : hours > 0 ? `${hours} hours ago` : `${minutes} minutes ago`;
}

export function CommentDisplay({ comment, className }: { comment: CommentCard; className?: string }) {
  const [showReplies, setShowReplies] = useState(false);
  const isDeleted = comment.isDeleted ?? false;
  const { data: response, isError } = useGetUserInfoQuery(comment.authorId, {
    skip: !comment.authorId || isDeleted,
  });
  const authorData = response?.user;
  const {data : authedUser} = useGetAuthedUserInfoQuery();
  const { handleLike, isLiked, isLikedLoading } = useLikeUnlikeComment({
    userId: authedUser?.id,
    comment: isDeleted ? undefined : comment,
  });
  const { allReplies, loadMoreComments, hasNextPage } = useInfinityReplies({ comment });
  const [inputReply, setInputReply] = useState(false);
  if (!comment) {
    return null;
  }

  if (!isDeleted && (isError || !authorData || isLikedLoading)) {
    return null;
  }
  const isDeletable = !isDeleted && authedUser?.id === comment.authorId;
  const displayName = isDeleted
    ? "Deleted comment"
    : `${authorData?.firstName} ${authorData?.lastName}`;
  const secondaryText = isDeleted
    ? "Comment unavailable"
    : `@${authorData?.username}`;
  const actionButtonClass = cn(
    "text-sm leading-none text-blue-500 transition-colors hover:text-blue-700",
    isDeleted && "text-muted-foreground hover:text-foreground"
  );

  function handleReplay() {
    // console.log("replying to comment", comment._id);
    setInputReply((prev) => !prev);
  }

  return <div className={cn("flex gap-2 px-5 py-2 border-b border-gray-300", isDeleted && "bg-muted/15", className)}>
    {isDeleted ? (
      <UserAvatar profileData={authorData} size="lg" deleted={isDeleted} />
    ) : (
      <Link to={`/profile/${comment.authorId}`} className="transition-transform duration-200 hover:scale-[1.03]">
        <UserAvatar profileData={authorData} size="lg" deleted={isDeleted} />
      </Link>
    )}
    <div className="flex flex-col w-full gap-0 leading-none">
      <div className="flex flex-wrap items-center gap-3">
        {isDeleted ? (
          <p className={cn("font-semibold", isDeleted && "text-muted-foreground")}>
            {displayName}
          </p>
        ) : (
          <Link
            to={`/profile/${comment.authorId}`}
            className="font-semibold transition-colors hover:text-primary"
          >
            {displayName}
          </Link>
        )}
        <p className={cn("font-extralight", isDeleted && "text-muted-foreground")}>{formatDate(comment.createdAt)}</p>
        {!isDeleted && comment.isEdited ? (
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Edited
          </p>
        ) : null}
        {!isDeleted && <EditCommentButton comment={comment} isDeletable={isDeletable} />}
      </div>
      {isDeleted ? (
        <p className={cn("text-sm text-gray-500", isDeleted && "text-muted-foreground")}>
          {secondaryText}
        </p>
      ) : (
        <Link
          to={`/profile/${comment.authorId}`}
          className="text-sm text-gray-500 transition-colors hover:text-primary"
        >
          {secondaryText}
        </Link>
      )}
      <div className="flex w-full justify-between items-start pt-1">
        <div className="min-w-0 flex-1">
          <CommentContent
            content={isDeleted ? "This comment has been deleted" : comment.content}
            className={cn(isDeleted && "text-muted-foreground italic")}
          />
          <div className="mt-1.5 flex items-center gap-5">
            {!isDeleted && (
              <button className={actionButtonClass} onClick={() => handleReplay()}>Reply</button>
            )}
            {comment.repliesCount! > 0 && (
              <button className={actionButtonClass} onClick={() => setShowReplies((prev) => !prev)}>
                View {comment.repliesCount} replies
              </button>
            )}
          </div>
        </div>
        {!isDeleted && (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              className={cn(
                "group rounded-full p-1.5 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isLiked?.answer
                  ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                  : "border border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent/60 hover:text-foreground"
              )}
              onClick={handleLike}
              aria-label={isLiked?.answer ? "Unlike comment" : "Like comment"}
            >
              <Heart
                size={16}
                fill={isLiked?.answer ? "currentColor" : "none"}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </button>
            <p className="text-xs font-medium text-muted-foreground ">
              {comment.likesCount}
            </p>
          </div>
        )}
        {isDeleted && (
          <div className="flex shrink-0 flex-col items-center gap-1 opacity-0" aria-hidden="true">
            <div className="rounded-full border border-border p-1.5">
              <Heart size={16} />
            </div>
            <p className="text-xs font-medium">0</p>
          </div>
        )}
      </div>

      {inputReply && <CommentInput target={comment!} />}

      {showReplies && allReplies && (
        <div className="pt-3">
          {allReplies.map((reply) => (
            <ReplayDisplay key={reply._id} comment={reply} className="border-none" />
          ))}
          {hasNextPage && (
            <button onClick={loadMoreComments} className="w-full py-2 text-center text-blue-500 hover:text-blue-700">View more replies</button>
          )}
        </div>
      )}
    </div>
  </div>
}
