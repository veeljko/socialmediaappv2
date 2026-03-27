
import { useGetPostInfoQuery } from "@/services/postApi";
import { useParams } from "react-router-dom";
import { PostCard } from "@/myComponents/postCard/PostCard";
import { useLikeUnlikePost } from "@/hooks/likeUnlikePost";
import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import CommentSection from "@/myComponents/Comment/CommentSection";
import {useInfinityComments} from "@/hooks/infinityComments";
import CommentInput from "@/myComponents/Comment/CommentInput";

export default function PostPage() {
  const postId = useParams().postId;
  const { data: user } = useGetAuthedUserInfoQuery();
  const { data: postInfo, isError } = useGetPostInfoQuery(postId!);
  const { handleLike : handleLikePost, isLiked : isLikedPost } = useLikeUnlikePost({ userId: user?.id, post: postInfo || undefined });
  const { data: authorData } = useGetUserInfoQuery(postInfo?.authorId || "", { skip: !postInfo?.authorId });
  const {allComments, loadMoreComments, loadedComments, hasNextPage} = useInfinityComments({post: postInfo!});
  const isDeletable: boolean = user?.id === postInfo?.authorId;
  
  if (isError || !postInfo || !authorData) return null;
  return (<div className="w-full h-full">
    <PostCard post={postInfo!} authorData={authorData?.user} isDeletable={isDeletable}
      className="w-max-[150px]">
      <PostCard.Heading />
      <PostCard.Separator />
      <PostCard.Body />
      <PostCard.Stats>
        <PostCard.LikeStat onClick={handleLikePost} isActivated={isLikedPost?.answer} />
        <PostCard.CommentStat />
        <PostCard.ShareStat />
      </PostCard.Stats>
    </PostCard>
    <CommentInput target={postInfo} />

    <CommentSection comments={allComments || []} loadMoreComments={loadMoreComments} loadedComments={loadedComments} commentsCount={postInfo?.commentsCount || 0} hasNextPage={hasNextPage} className="w-full" />
  </div>
  )
}
