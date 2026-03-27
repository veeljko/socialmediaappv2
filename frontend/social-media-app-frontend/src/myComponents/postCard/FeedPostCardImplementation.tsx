
import { type Post } from "@/features/post/types";
import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import { memo, useState } from "react";
import { useLikeUnlikePost } from "@/hooks/likeUnlikePost";
import { PostCard } from "./PostCard";
import { PopUpComponent } from "../PopupComponents/PopUpComponent";
import { ShowLikesPost } from "../PopupComponents/ShowLikes";

type PostCardProps = {
  post: Post;
  className?: string;
};

function PostCardImplementation({ post, className: _className }: PostCardProps) {
  const { data: user } = useGetAuthedUserInfoQuery();
  const { data: authorData } = useGetUserInfoQuery(post?.authorId || "",);
  const { handleLike, isLiked } = useLikeUnlikePost({ userId: user?.id, post: post || undefined });
  const isDeletable: boolean = user?.id === post?.authorId;
  const [showLikes, setShowLikes] = useState(false);

  if (!post || !user || !authorData) return;
  
  return <>
    <PopUpComponent isOpen={showLikes} onClose={() => setShowLikes(false)}>
      <ShowLikesPost postId={post._id} />
    </PopUpComponent>
    <PostCard post={post} authorData={authorData.user} isDeletable={isDeletable}
      className="w-max-[150px]">
      <PostCard.Heading />
      <PostCard.Separator />
      <PostCard.Body />
      <PostCard.Stats>
        <PostCard.LikeStat onClick={handleLike} isActivated={isLiked?.answer} setShowLikes={setShowLikes} />
        <PostCard.CommentStat />
      </PostCard.Stats>
    </PostCard>
  </>
}

export default memo(PostCardImplementation);
