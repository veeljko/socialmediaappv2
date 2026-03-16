import { useGetUserInfoQuery } from "@/services/authApi";
import type { CommentCard } from "../features/comment/types";
import { Heart } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import CommentContent from "./CommentContent";
import { useLikeUnlikeComment } from "@/hooks/likeUnlikeComment";
import { useState } from "react";
import { useInfinityReplies } from "@/hooks/infinityReplies";
import { ReplayDisplay } from "./ReplyDisplay";

function formatDate(createdAt: string) {
  const difference = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days} days ago` : hours > 0 ? `${hours} hours ago` : `${minutes} minutes ago`;
}

export function CommentDisplay({ comment, className }: { comment: CommentCard; className?: string }) {
  const [showReplies, setShowReplies] = useState(false);
  const { data: response, isError } = useGetUserInfoQuery(comment.authorId, { skip: !comment.authorId });
  const authorData = response?.user;
  const { handleLike, isLiked, isLikedLoading} = useLikeUnlikeComment({ userId: authorData?.id, comment });
  const { allReplies, loadMoreComments, loadedComments } = useInfinityReplies({ comment });

  if (isError || !authorData || !comment || isLikedLoading) {
    return null;
  }
  return <div className={`flex gap-2 px-5 py-2 border-b border-gray-300 ${className || ""}`}>
    <UserAvatar profileData={authorData} size="lg" />
    <div className="flex flex-col w-full gap-0 leading-none">
      <div className="flex gap-3">
        <p className="font-semibold">{authorData?.firstName} {authorData?.lastName}</p>
        <p className="font-extralight">{formatDate(comment.createdAt)}</p>
      </div>
      <p className="text-sm text-gray-500">@{authorData?.username}</p>
      <div className="flex w-full justify-between pt-2">
        <CommentContent content={comment.content} />
        <div className="flex flex-col items-center align-top">
          <Heart className={"w-5 h-5 cursor-pointer"} fill={isLiked?.answer ? "red" : "none"} onClick={async () => {
            await handleLike();
          }} />
          <p>{comment.likesCount}</p>
        </div>
      </div>
      <div className="flex gap-5 mt-2">
        <button className="text-blue-500 hover:text-blue-700">Reply</button>
        <button className="text-blue-500 hover:text-blue-700" onClick={() => setShowReplies((prev) => !prev)}>View {comment.repliesCount} replies</button>
      </div>
      {showReplies && allReplies && (
          <div className=" ">
            {allReplies.map((reply) => (
              <ReplayDisplay key={reply._id} comment={reply} className="border-none"/>
            ))}
            {loadedComments < comment.repliesCount! && (
              <button onClick={loadMoreComments} className="w-full py-2 text-center text-blue-500 hover:text-blue-700">View {comment.repliesCount! - loadedComments} more replies</button>
            )}
          </div>
        )}
    </div>
  </div>
}