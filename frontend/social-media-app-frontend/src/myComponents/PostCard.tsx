import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EditPostButton } from "./EditPostButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PostContent from "./PostContent"
import PostMedia from "./PostMedia"
import { Heart, MessageCircleDashed, Share } from "lucide-react"
import { type Post } from "@/features/post/types";
import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import { useIsPostLikedByUserQuery, useLikePostMutation, useUnlikePostMutation } from "@/services/postApi";
import { Link, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { store } from "@/app/store";
import { useAppSelector } from "@/hooks/getUser";
import { memo } from "react";
import { UserAvatar } from "./UserAvatar";

type PostCardProps = {
    post: Post;
    className?: string;
};

function PostCard({ post, className }: PostCardProps) {
    const {data : user} = useGetAuthedUserInfoQuery();
    const { data: authorData } = useGetUserInfoQuery(post.authorId || "");

    const urls: string[] = post.mediaUrls?.map(media => media.secure_url) || [];

    const { data: isLiked } = useIsPostLikedByUserQuery({userId : user?.id || "", postId : post._id}, {skip : !user});
    const [likePost] = useLikePostMutation();
    const [unlikePost] = useUnlikePostMutation();

    const handleLike = async () => {
        if (!isLiked?.answer) await likePost(post);
        else await unlikePost(post);
    }

    const isDeletable : boolean = user?.id === post.authorId; 

    return (
        <Card
            className={cn(
                "m-2 border-0 px-5 my-5  rounded-2xl hover:shadow-2xl inset-shadow-xs inset-shadow-indigo-600 bg-transparent text-foreground",
                "border-neutral-800",
                className
            )}
        >
            <div className="flex flex-col gap-1.5">
                {/*HEADING*/}
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <Link to={`/profile/${post.authorId}`}>
                            <UserAvatar profileData={authorData?.user}/>
                        </Link>
                        <div className="flex flex-col justify-center gap-0 leading-none">
                            <p className="font-medium">{authorData?.user?.firstName}</p>
                            <Link to={`/profile/${post.authorId}`}>
                                <p className="font-light">{authorData?.user?.username}</p>
                            </Link>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <EditPostButton post={post} isDeletable={isDeletable}/>
                    </div>
                </div>
                <Separator />
                <div className="pl-1">
                    <PostContent
                        content={post?.content || ""}
                    />
                </div>
                <div className="flex justify-center">
                    <PostMedia media={urls} />
                </div>

                <div className="flex justify-evenly">
                    <div className="flex gap-2" onClick={handleLike}>
                        {isLiked?.answer ?
                            <Heart color="red" fill="red"/>
                            :
                            <Heart />
                        }
                        <p>{post?.likesCount}</p>
                    </div>
                    <div className="flex gap-2">
                        <MessageCircleDashed />
                        <p>{post.commentCount}</p>
                    </div>
                    <div className="flex gap-2">
                        <Share />
                        <p>0</p>
                    </div>
                </div>
            </div>

        </Card>

    );
}

export default memo(PostCard);
