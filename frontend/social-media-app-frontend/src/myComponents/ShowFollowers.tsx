import { useInfinityFollowers } from "@/hooks/infinityFollowers";
import { FollowerItem } from "./FollowerItem";
import { ListUsers } from "./ListUsers";


export function ShowFollowers({ profileId }: { profileId: string | undefined }) {
  const { allFollowers, loadMoreRef } = useInfinityFollowers({ profileId });

  return (
    <div className="overflow-y-auto h-[500px]">
      <ListUsers ids={allFollowers?.map((follower) => follower.followerId) || []} child={FollowerItem}/>
      <div ref={loadMoreRef} className="h-5"></div>
    </div>
  )
}
