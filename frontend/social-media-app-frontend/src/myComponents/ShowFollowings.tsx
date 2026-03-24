import { useInfinityFollowings } from "@/hooks/infinityFollowings";
import { FollowingItem } from "./FollowingItem";


export function ShowFollowings({ profileId }: { profileId: string | undefined }) {
  const { allFollowings, loadMoreRef } = useInfinityFollowings({ profileId });

  console.log(allFollowings);
  return (
    <div className="overflow-y-scroll h-[500px]">
      {allFollowings?.map((following) => (
        <FollowingItem
          key={following._id}
          userId={following.followingId}
        />
      ))}
      <div ref={loadMoreRef} className="h-5"></div>
    </div>
  )
}
