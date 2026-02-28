import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EditPostButton } from "./EditPostButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PostContent from "./PostContent"
import PostMedia from "./PostMedia"
import { Heart, MessageCircleDashed, Share } from "lucide-react"
import { type Post } from "@/features/post/types";
import { useLazyGetUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import { useIsPostLikedByUserQuery, useLikePostMutation, useUnlikePostMutation, useGetPostInfoQuery } from "@/services/postApi";
import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { useEffect } from "react";
import { Link } from "react-router-dom";

type PostCardProps = {
    postId: string;
    onLike?: (postId: string) => void | Promise<void>;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
    className?: string;
};

export function PostCard({ postId, className }: PostCardProps) {
    const { data: post } = useGetPostInfoQuery(postId);
    const user = useAppSelector((s) => s.auth.user);

    const { data: userData } = useGetUserInfoQuery(post?.authorId || "", { skip: !post });
    const urls: string[] = post?.mediaUrls?.map(media => media.secure_url) || [];

    const { data: isLiked } = useIsPostLikedByUserQuery({userId : user?.id || "", postId : post?._id || ""}, {skip : !user || !post});
    const [likePost] = useLikePostMutation();
    const [unlikePost] = useUnlikePostMutation();

    const handleLike = async () => {
        if (!post) return;
        if (!isLiked?.answer) likePost(post._id);
        else unlikePost(post._id);

    }
    // useEffect(() => {
        //     if (!user?.id) return;
        //     isPostLikedByUser({ postId, userId: user.id });
        // }, [postId, user?.id]);
        
        
    if (!user) return null;
    if (!post) return null;
    const isDeletable : boolean = user.id === post.authorId; 
    
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
                            <Avatar size="lg">
                                <AvatarImage
                                    src={userData?.user?.avatar?.secure_url || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItaWNvbiBsdWNpZGUtdXNlciI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4="}
                                    alt="@shadcn"
                                    className=""
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex flex-col justify-center gap-0 leading-none">
                            <p className="font-medium">{userData?.user?.firstName}</p>
                            <Link to={`/profile/${post.authorId}`}>
                                <p className="font-light">{userData?.user?.username}</p>
                            </Link>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <EditPostButton postId={postId} authorId={post.authorId} isDeletable={isDeletable}/>
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
