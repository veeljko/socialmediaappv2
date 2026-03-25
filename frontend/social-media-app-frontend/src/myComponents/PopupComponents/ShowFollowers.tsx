import { useInfinityFollowers } from "@/hooks/infinityFollowers";
import { FollowerItem } from "./FollowerItem";
import { ListUsers } from "./ListUsers";


export function ShowFollowers({ profileId }: { profileId: string | undefined }) {
  const { allFollowers, loadMoreRef } = useInfinityFollowers({ profileId });
  const followersCount = allFollowers?.length ?? 0;
  const hasFollowers = followersCount > 0;

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl bg-background">
      <div className="border-b border-border px-6 py-5 text-center">
        <p className="text-2xl font-semibold tracking-tight">Followers</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {hasFollowers ? (
          <div className="space-y-2">
            <ListUsers ids={allFollowers?.map((follower) => follower.followerId) || []} child={FollowerItem} />
            <div ref={loadMoreRef} className="h-6" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
            <p className="text-lg font-medium">No followers yet</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Once people start following this profile, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
