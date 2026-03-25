import { LikesItem } from "./LikesItem";
import { ListUsers } from "./ListUsers";
import { useInfinityLikes } from "@/hooks/infinityLikes";



export function ShowLikesPost({ postId }: { postId: string | undefined }) {
  const { allLikes, loadMoreRef } = useInfinityLikes({ postId });

  return (
    <div className="overflow-y-auto h-[500px]">
      <ListUsers ids={allLikes?.map((like) => like.userId) || []} child={LikesItem}/>
      <div ref={loadMoreRef} className="h-5"></div>
    </div>
  )
}
