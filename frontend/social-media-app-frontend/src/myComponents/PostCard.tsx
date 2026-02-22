import {Separator} from "@/components/ui/separator"
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EditPostButton } from "./EditPostButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PostContent from "./PostContent"
import PostMedia from "./PostMedia"
import {Heart, MessageCircleDashed, Share} from "lucide-react"

type PostAuthor = {
  name: string;
  username: string; 
  avatarUrl?: string | null;
};

export type Post = {
  id: string;
  author: PostAuthor;
  createdAt: string;
  content: string;
  imageUrls: string[] | null;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  isLiked?: boolean;
};

type PostCardProps = {
  post: Post;
  onLike?: (postId: string) => void | Promise<void>;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
};

function formatTimeAgo(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;

  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return `${sec}s`;
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  return `${day}d`;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  className,
}: PostCardProps) {


  return (
    <Card
      className={cn(
        "m-2  px-5 border-1 rounded-2xl shadow-xl bg-transparent text-foreground",
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
                src="https://github.com/shadcn.png"
                alt="@shadcn"
                className=""
                />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center gap-0 leading-none">
                <p className="font-medium">{post.author.name}</p>
                <p className="font-light">{post.author.username}</p>
            </div>
        </div>
        <div className="flex justify-end">
        <EditPostButton />
        </div>
        </div>
        <Separator/>
        <div className="pl-1">
            <PostContent
                content="lkg;l;gfds;gfdslk;gkfdsfgsd;lg;sl;l;lg;dsflgfdsl;gflkg;lsdfkgl;sdk;lfkgl;sdkl;fkgl;sdkfgl;fdskgl;fdksgfjlkdgsjkgfdsjkgfdsjlgfdskjlkfgdsljjlkgsfdljk"
            />
        </div>
        <div className="flex justify-center">
            <PostMedia media={["https://picsum.photos/200/300/", "https://picsum.photos/200/800/", "https://picsum.photos/900/300/"]}/>
        </div>
        <div className="flex justify-evenly">
            <div className="flex gap-2">
                <Heart/>
                <p>5</p>
            </div>
            <div className="flex gap-2">
                <MessageCircleDashed/>
                <p>5</p>
            </div>
            <div className="flex gap-2">
                <Share/>
                <p>5</p>
            </div>
        </div>
    </div>
    
    </Card>
    
  );
}
