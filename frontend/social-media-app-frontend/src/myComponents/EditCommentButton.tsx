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
import { Link } from "react-router-dom";
import type { CommentCard } from "@/features/comment/types";
import { useDeleteCommentMutation } from "@/services/commentApi";

export function EditCommentButton({ comment, isDeletable }: { comment: CommentCard, isDeletable: boolean }) {
  const [deleteComment] = useDeleteCommentMutation();

  const handleDelete = async (e: React.MouseEvent) => {
    await deleteComment(comment);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-2.5" variant="link"><HamburgerMenuIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <UserIcon />
          <Link to={`/profile/${comment.authorId}`}>
            Profile
          </Link>
        </DropdownMenuItem>
        {isDeletable && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <LucideDelete />
            Delete Comment
          </DropdownMenuItem>
        </>
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
