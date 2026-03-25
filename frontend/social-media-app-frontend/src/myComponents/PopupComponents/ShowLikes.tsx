import { LikesItem } from "./LikesItem";
import { ListUsers } from "./ListUsers";
import { useInfinityLikes } from "@/hooks/infinityLikes";



export function ShowLikesPost({ postId }: { postId: string | undefined }) {
  const { allLikes, loadMoreRef } = useInfinityLikes({ postId });
  const hasLikes = (allLikes?.length ?? 0) > 0;

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl bg-background">
      <div className="border-b border-border px-6 py-5 text-center">
        <p className="text-2xl font-semibold tracking-tight">Likes</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {hasLikes ? (
          <div className="space-y-2">
            <ListUsers ids={allLikes?.map((like) => like.userId) || []} child={LikesItem} />
            <div ref={loadMoreRef} className="h-6" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
            <p className="text-lg font-medium">No likes yet</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              People who like this post will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
