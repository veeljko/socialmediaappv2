import { useInfinityFollowers } from "@/hooks/infinityFollowers";
import { FollowerItem } from "./FollowerItem";


export function ShowFollowers({ profileId }: { profileId: string | undefined }) {
  const { allFollowers, loadMoreRef } = useInfinityFollowers({ profileId });

  console.log(allFollowers);
  return (
    <div className="overflow-y-scroll h-[500px]">
      {allFollowers?.map((follower) => (
        <FollowerItem
          key={follower._id}
          userId={follower.followerId}
        />
      ))}
      <div ref={loadMoreRef} className="h-5"></div>
    </div>
  )
}
