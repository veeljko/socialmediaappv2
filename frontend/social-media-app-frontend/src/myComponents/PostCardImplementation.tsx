
import { type Post } from "@/features/post/types";
import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import { memo } from "react";
import { useLikeUnlike } from "@/hooks/likeUnlike";
import { PostCard } from "./postCard/PostCard";

type PostCardProps = {
    post: Post;
    className?: string;
};

function PostCardImplementation({ post, className }: PostCardProps) {
    const { data: user } = useGetAuthedUserInfoQuery();
    const { data: authorData } = useGetUserInfoQuery(post?.authorId || "");
    const { handleLike, isLiked } = useLikeUnlike({ userId: user?.id, post: post || undefined });
    const isDeletable: boolean = user?.id === post?.authorId;

    if (!post || !user || !authorData) return;
    return <>
        <PostCard post={post} authorData={authorData.user} isDeletable={isDeletable}
            className="w-max-[150px]">
            <PostCard.Heading />
            <PostCard.Separator />
            <PostCard.Body />
            <PostCard.Stats>
                <PostCard.LikeStat onClick={handleLike} isActivated={isLiked?.answer} />
                <PostCard.CommentStat />
                <PostCard.ShareStat />
            </PostCard.Stats>
        </PostCard>
    </>
}

export default memo(PostCardImplementation);
