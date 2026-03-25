import { useInfinityFollowings } from "@/hooks/infinityFollowings";
import { ListUsers } from "./ListUsers";
import { FollowingItem } from "./FollowingItem";


export function ShowFollowings({ profileId }: { profileId: string | undefined }) {
  const { allFollowings, loadMoreRef } = useInfinityFollowings({ profileId });
  const hasFollowings = (allFollowings?.length ?? 0) > 0;

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl bg-background">
      <div className="border-b border-border px-6 py-5 text-center">
        <p className="text-2xl font-semibold tracking-tight">Followings</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {hasFollowings ? (
          <div className="space-y-2">
            <ListUsers ids={allFollowings?.map((follower) => follower.followingId) || []} child={FollowingItem} />
            <div ref={loadMoreRef} className="h-6" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
            <p className="text-lg font-medium">No followings yet</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Profiles this user follows will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
