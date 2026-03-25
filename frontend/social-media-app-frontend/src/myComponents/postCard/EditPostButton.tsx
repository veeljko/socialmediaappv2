import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LucideDelete,
  UserIcon,
} from "lucide-react"
import {
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { useDeletePostMutation } from "@/services/postApi";
import { Link } from "react-router-dom";
import type { Post } from "@/features/post/types";

export function EditPostButton({ post, isDeletable }: { post: Post, isDeletable: boolean }) {
  const [deletePost] = useDeletePostMutation();

  const handleDelete = async (e: React.MouseEvent) => {
    await deletePost(post);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-9 w-9 rounded-full border border-border/70 bg-background/80 text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-foreground hover:shadow-md"
          variant="ghost"
        >
          <HamburgerMenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-border/70 shadow-xl">
        <DropdownMenuItem>
          <UserIcon />
          <Link to={`/profile/${post.authorId}`}>
            Profile
          </Link>
        </DropdownMenuItem>
        {isDeletable && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <LucideDelete />
            Delete Post
          </DropdownMenuItem>
        </>
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
