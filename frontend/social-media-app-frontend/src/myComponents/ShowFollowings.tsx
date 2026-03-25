import { useInfinityFollowings } from "@/hooks/infinityFollowings";
import { ListUsers } from "./ListUsers";
import { FollowerItem } from "./FollowerItem";
import { FollowingItem } from "./FollowingItem";


export function ShowFollowings({ profileId }: { profileId: string | undefined }) {
  const { allFollowings, loadMoreRef } = useInfinityFollowings({ profileId });

  return (
    <div className="overflow-y-auto h-[500px]">
      <ListUsers ids={allFollowings?.map((follower) => follower.followingId) || []} child={FollowingItem}/>
      <div ref={loadMoreRef} className="h-5"></div>
    </div>
  )
}
