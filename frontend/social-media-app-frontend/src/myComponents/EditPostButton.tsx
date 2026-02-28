import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CreditCardIcon,
  LucideDelete,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import {
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { useDeletePostMutation } from "@/services/postApi";
import { Link } from "react-router-dom";

export function EditPostButton({ postId, authorId, isDeletable }: { postId: string, authorId: string, isDeletable: boolean }) {
  const [deletePost] = useDeletePostMutation();

  const handleDelete = (e: React.MouseEvent) => {
    deletePost(postId);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-2.5" variant="link"><HamburgerMenuIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <UserIcon />
          <Link to={`/profile/${authorId}`}>
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
