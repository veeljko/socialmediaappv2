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
        <Button className="size-2.5" variant="link"><HamburgerMenuIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
