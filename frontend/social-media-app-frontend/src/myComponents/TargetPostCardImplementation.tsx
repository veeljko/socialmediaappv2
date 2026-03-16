
import { type Post } from "@/features/post/types";
import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import { memo } from "react";
import { useLikeUnlikePost } from "@/hooks/likeUnlikePost";
import { PostCard } from "./postCard/PostCard";
import {useInfinityComments} from "@/hooks/infinityComments";
import { CommentCard } from "./CommentCard";
import { useIsCommentLikedByUserQuery } from "@/services/commentApi";

type PostCardProps = {
    post: Post;
    className?: string;
};

function TargetPostCardImplementation({ post, className }: PostCardProps) {
    const { data: user } = useGetAuthedUserInfoQuery();
    const { data: authorData } = useGetUserInfoQuery(post?.authorId || "", { skip: !post?.authorId });
    const { handleLike : handleLikePost, isLiked : isLikedPost } = useLikeUnlikePost({ userId: user?.id, post: post || undefined });
    const isDeletable: boolean = user?.id === post?.authorId;
    const {allComments, loadMoreComments, loadedComments} = useInfinityComments({post});

    if (!post || !user || !authorData) return;
    return <div>
        <PostCard post={post} authorData={authorData.user} isDeletable={isDeletable}
            className="w-max-[150px]">
            <PostCard.Heading />
            <PostCard.Separator />
            <PostCard.Body />
            <PostCard.Stats>
                <PostCard.LikeStat onClick={handleLikePost} isActivated={isLikedPost?.answer} />
                <PostCard.ShareStat />
            </PostCard.Stats>
        </PostCard>
        {allComments?.map((comment) => 
          <CommentCard key={comment._id} comment={comment} />)
        }
        {post.commentsCount && loadedComments < post.commentsCount && (
            <button onClick={loadMoreComments} className="w-full py-2 text-center text-blue-500 hover:text-blue-700">View {post.commentsCount - loadedComments} more comments</button>
        )}

    </div>
}

export default memo(TargetPostCardImplementation);
