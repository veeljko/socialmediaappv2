import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EditPostButton } from "./EditPostButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PostContent from "./PostContent"
import PostMedia from "./PostMedia"
import { Heart, MessageCircleDashed, Share } from "lucide-react"
import { type Post } from "@/features/post/types";
import { useGetUserInfoQuery } from "@/services/authApi";
import { startTransition, use, useEffect, useOptimistic, useMemo, useState } from "react";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { useIsPostLikedByUserQuery, useLikePostMutation, useUnlikePostMutation } from "@/services/postApi";
import { useAppDispatch, useAppSelector } from "../hooks/getUser";

type PostCardProps = {
    post: Post;
    onLike?: (postId: string) => void | Promise<void>;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
    className?: string;
};

interface PostInfo {
    isLiked: boolean,
    likesCount: number,
    commentCount: number,
}


export function PostCard({ post, className }: PostCardProps) {
    const user = useAppSelector((s) => s.auth.user);
    if (!user) return null;
    const {data : isLiked } = useIsPostLikedByUserQuery({postId : post._id, userId : user?.id});
    const [postLiked, setPostLiked] = useState<boolean>(isLiked?.answer || false);
    const { data: userData } = useGetUserInfoQuery(post.authorId);
    const urls: string[] = post.mediaUrls?.map(media => media.secure_url) || [];

    const [likePost] = useLikePostMutation();
    const [unlikePost] = useUnlikePostMutation();

    const handleLike = async () => {
        try{
            if (!isLiked?.answer) {
                await likePost(post._id).unwrap();
                setPostLiked(true);
            } else {
                await unlikePost(post._id).unwrap();
                setPostLiked(false);
            }
        }
        catch(err){
            console.log(err);
        }
    }


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
                        <Avatar size="lg">
                            <AvatarImage
                                src={userData?.user?.avatar?.secure_url || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItaWNvbiBsdWNpZGUtdXNlciI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4="}
                                alt="@shadcn"
                                className=""
                            />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col justify-center gap-0 leading-none">
                            <p className="font-medium">{userData?.user?.firstName}</p>
                            <p className="font-light">{userData?.user?.username}</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <EditPostButton />
                    </div>
                </div>
                <Separator />
                <div className="pl-1">
                    <PostContent
                        content={post.content}
                    />
                </div>
                <div className="flex justify-center">
                    <PostMedia media={urls} />
                </div>
                <div className="flex justify-evenly">
                    <div className="flex gap-2" onClick={handleLike}>
                        {postLiked ?
                            <HeartFilledIcon />
                            :
                            <Heart />
                        }
                        <p>{post.likesCount}</p>
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
