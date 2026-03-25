import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetUserInfoByUsernameQuery, useGetUserInfoQuery } from "@/services/authApi";
import { useInfinityUserPosts } from "@/hooks/infinityUserPosts";
import { useFollowUser } from "@/hooks/followUser";
import { useCheckIsAuthedsProfile } from "@/hooks/checkIsAuthedsPorifle";
import PostCardImplementation from "@/myComponents/FeedPostCardImplementation";
import { EndOfPosts } from "@/myComponents/EndOfPosts";
import { AvatarCard } from "@/myComponents/AvatarCard";
import { PopUpComponent } from "@/myComponents/PopUpComponent";
import { ShowFollowers } from "@/myComponents/ShowFollowers";
import { ShowFollowings } from "@/myComponents/ShowFollowings";

export default function ProfilePage() {
  const params = useParams();
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingsOpen, setIsFollowingsOpen] = useState(false);

  const { data: profileById } = useGetUserInfoQuery(params.profileId || "", {
    skip: !params.profileId,
  });
  const { data: profileByUsername } = useGetUserInfoByUsernameQuery(params.username || "", {
    skip: !params.username,
  });
  const profileData = profileById || profileByUsername;

  const { allPosts, loadMoreRef } = useInfinityUserPosts({ profileId: params.profileId });
  const { isAuthedUser } = useCheckIsAuthedsProfile({ profileId: profileData?.user.id });
  const { handleFollow, isFollowing } = useFollowUser({ profileId: profileData?.user.id });

  useEffect(() => {
    setIsFollowersOpen(false);
  }, [params.profileId]);
  
  if (!profileData) return null;

  return (
    <div className="flex flex-col">
      <PopUpComponent isOpen={isFollowersOpen} onClose={() => setIsFollowersOpen(false)}>
        <ShowFollowers profileId={profileData?.user.id} />
      </PopUpComponent>
      <PopUpComponent isOpen={isFollowingsOpen} onClose={() => setIsFollowingsOpen(false)}>
        <ShowFollowings profileId={profileData?.user.id} />
      </PopUpComponent>
      <AvatarCard setIsFollowersOpen={setIsFollowersOpen} setIsFollowingsOpen={setIsFollowingsOpen} profileData={profileData.user}>
        {!isAuthedUser &&
          <AvatarCard.FollowButton isActive={isFollowing} onClick={handleFollow} />
        }
      </AvatarCard>


      {allPosts?.map((post) => (
        <PostCardImplementation
          key={post._id}
          post={post}
        />
      ))}


      <EndOfPosts loadMoreRef={loadMoreRef} />
    </div>)
}


