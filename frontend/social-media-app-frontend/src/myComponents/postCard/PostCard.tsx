import { Card } from "@/components/ui/card";
import type { Post } from "@/features/post/types";
import { cn } from "@/lib/utils";
import { Heart, MessageCircleDashed, Share } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { EditPostButton } from "../EditPostButton";
import PostContent from "../PostContent";
import PostMedia from "../PostMedia";
import { UserAvatar } from "../UserAvatar";
import type { User } from "@/features/auth/types";
import { createContext, useContext, type ReactNode } from "react";

type PostCardProps = {
    post: Post;
    className?: string;
    isDeletable: boolean | false,
    authorData?: User,
    children: ReactNode
};

const defaultValue: any = null;
const PostContext = createContext(defaultValue);

export function PostCard({ post, authorData, className, isDeletable, children }: PostCardProps) {
    return (
        <PostContext.Provider value={{ post, authorData, isDeletable }}>
            <Card className={cn(
                "m-2 border-0 px-5 my-5  rounded-2xl hover:shadow-2xl inset-shadow-xs inset-shadow-indigo-600 bg-transparent text-foreground",
                "border-neutral-800",
                className
            )}>
                {children}
            </Card>
        </PostContext.Provider>
    )

}

PostCard.Heading = function PostCardHeading() {
    const { post, authorData, isDeletable } : {
        post : Post,
        authorData : User,
        isDeletable : boolean,
    } = useContext(PostContext);

    return (<div className="flex justify-between">
        <div className="flex gap-2">
            <Link to={`/profile/${post.authorId}`}>
                <UserAvatar profileData={authorData} size="lg" />
            </Link>
            <div className="flex flex-col justify-center gap-0 leading-none">
                <p className="font-medium">{authorData.firstName || ""} {authorData.lastName || ""}</p>
                <Link to={`/profile/${post.authorId}`}>
                    <p className="font-light">{authorData.username}</p>
                </Link>
            </div>
        </div>
        <div className="flex justify-end">
            <EditPostButton post={post} isDeletable={isDeletable} />
        </div>
    </div>)
}

PostCard.Separator = function PostCardSeparator() {
    return <Separator />
}

PostCard.Body = function PostCardBody() {
    const { post } : {post : Post} = useContext(PostContext);
    const mediaUrls: string[] = post?.mediaUrls?.map((media: { secure_url: string; }) => media.secure_url) || [];
    return <>
        <div className="pl-1">
            <PostContent
                content={post?.content || ""}
            />
        </div>
        <div className="flex justify-center">
            <PostMedia media={mediaUrls} />
        </div>
    </>
}

PostCard.Stats = function PostCardStats({ children }: { children: ReactNode }) {
    return <div className="flex justify-evenly">
        {children}
    </div>
}

interface PostCardLikeStatProps {
    onClick: () => void,
    isActivated?: boolean | false,
}

PostCard.LikeStat = function PostCardLikeStat({ onClick, isActivated, }: PostCardLikeStatProps) {
    const {post} : {post : Post} = useContext(PostContext);
    return <div className="flex gap-2" onClick={onClick}>
        {isActivated ?
            <Heart fill="red" />
            :
            <Heart />
        }
        <p>{post.likesCount}</p>
    </div>
}

PostCard.CommentStat = function PostCardCommentStat() {
    const {post} : {post : Post} = useContext(PostContext);
    return <div className="flex gap-2">
        <MessageCircleDashed />
        <p>{post.commentCount}</p>
    </div>
}

PostCard.ShareStat = function PostCardShareStat() {
    return <div className="flex gap-2">
        <Share />
        <p>0</p>
    </div>
}

