import { Card } from "@/components/ui/card";
import type { Post } from "@/features/post/types";
import { cn } from "@/lib/utils";
import { ChevronRight, Dot, Heart, MessageCircleDashed, Share } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { EditPostButton } from "./EditPostButton";
import PostContent from "./PostContent";
import PostMedia from "./PostMedia";
import { UserAvatar } from "../Profile/UserAvatar";
import type { User } from "@/features/auth/types";
import { createContext, useContext, type ReactNode } from "react";

type PostCardProps = {
  post: Post;
  className?: string;
  isDeletable: boolean | false,
  authorData?: User,
  children: ReactNode,
};

const defaultValue: any = null;
const PostContext = createContext(defaultValue);

function formatDate(createdAt: string) {
  const difference = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days} days ago` : hours > 0 ? `${hours} hours ago` : `${minutes} minutes ago`;
}

export function PostCard({ post, authorData, className, isDeletable, children }: PostCardProps) {
  return (
    <PostContext.Provider value={{ post, authorData, isDeletable }}>
      <Card className={cn(
        "group mx-2 my-5 overflow-hidden rounded-3xl border border-border/70 bg-card/90 px-5 py-4 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-xl",
        className
      )}>
        {children}
      </Card>
    </PostContext.Provider>
  )

}

PostCard.Heading = function PostCardHeading() {
  const { post, authorData, isDeletable }: {
    post: Post,
    authorData: User,
    isDeletable: boolean,
  } = useContext(PostContext);

  return (<div className="flex items-start justify-between gap-4">
    <div className="flex min-w-0 gap-3">
      <Link
        to={`/profile/${post.authorId}`}
        className="transition-transform duration-200 hover:scale-[1.03]"
      >
        <UserAvatar profileData={authorData} size="xl" />
      </Link>
      <div className="min-w-0 pt-0.5">
        <div className="flex flex-wrap items-center gap-1 text-sm leading-none">
          <Link
            to={`/profile/${post.authorId}`}
            className="truncate font-semibold tracking-tight transition-colors hover:text-primary"
          >
            {authorData.firstName || ""} {authorData.lastName || ""}
          </Link>
          <Dot size={14} className="text-muted-foreground" />
          <Link
            to={`/profile/${post.authorId}`}
            className="font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            @{authorData.username}
          </Link>
        </div>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {formatDate(post.createdAt)}
        </p>
      </div>
    </div>
    <div className="flex shrink-0 justify-end">
      <EditPostButton post={post} isDeletable={isDeletable} />
    </div>
  </div>)
}

PostCard.Separator = function PostCardSeparator() {
  return <Separator className="opacity-70" />
}

PostCard.Body = function PostCardBody() {
  const { post }: { post: Post } = useContext(PostContext);
  const mediaUrls: string[] = post?.mediaUrls?.map((media: { secure_url: string; }) => media.secure_url) || [];
  return <>
    <div className="space-y-2 pl-1">
      <PostContent
        content={post?.content || ""}
        className="text-[15px] leading-7 text-foreground/95"
      />
      <div className="flex justify-center">
        <PostMedia media={mediaUrls} />
      </div>
    </div>
  </>
}

PostCard.Stats = function PostCardStats({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">
    {children}
  </div>
}

interface PostCardLikeStatProps {
  onClick: () => void,
  isActivated?: boolean | false,
  setShowLikes?: React.Dispatch<React.SetStateAction<boolean>>
}

PostCard.LikeStat = function PostCardLikeStat({ onClick, isActivated, setShowLikes }: PostCardLikeStatProps) {
  const { post }: { post: Post } = useContext(PostContext);

  return <div className="flex items-center gap-2 rounded-full bg-muted/35 p-1 pr-1.5">
    <button
      type="button"
      className={cn(
        "group rounded-full p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActivated
          ? "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
          : "border border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent/60 hover:text-foreground"
      )}
      onClick={onClick}
      aria-label={isActivated ? "Unlike post" : "Like post"}
    >
      <Heart
        size={18}
        fill={isActivated ? "currentColor" : "none"}
        className="transition-transform duration-200 group-hover:scale-110"
      />
    </button>
    <button
      type="button"
      className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/60 hover:text-accent-foreground hover:shadow-md"
      onClick={(e) => {
        e.stopPropagation();
        setShowLikes?.((prev) => !prev);
      }}
      aria-label="Open likes list"
    >
      <span>{post.likesCount} likes</span>
      <ChevronRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  </div>
}

PostCard.CommentStat = function PostCardCommentStat() {
  const { post }: { post: Post } = useContext(PostContext);
  const navigate = useNavigate();
  const handleOpenComments = () => {
    navigate(`/post/${post._id}`);
  };

  return (
    <div className="flex items-center gap-2 rounded-full bg-muted/35 p-1 pr-1.5">
      <button
        type="button"
        className="group rounded-full border border-border bg-background p-2 text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/60 hover:text-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={handleOpenComments}
        aria-label="Open post comments"
      >
        <MessageCircleDashed
          size={18}
          className="transition-transform duration-200 group-hover:scale-110"
        />
      </button>
      <button
        type="button"
        className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/60 hover:text-accent-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={handleOpenComments}
        aria-label="Open post comments list"
      >
        <span>{post.commentsCount} comments</span>
        <ChevronRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}

PostCard.ShareStat = function PostCardShareStat() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-muted/35 p-1 pr-1.5">
      <button
        type="button"
        className="group rounded-full border border-border bg-background p-2 text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/60 hover:text-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Share post"
      >
        <Share
          size={18}
          className="transition-transform duration-200 group-hover:scale-110"
        />
      </button>
      <button
        type="button"
        className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/60 hover:text-accent-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Share post"
      >
        <span>Share</span>
        <ChevronRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}
