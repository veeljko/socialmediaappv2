import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import UserInfo from "../Profile/UserInfo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFollowUserMutation, useIsFollowingQuery, useUnFollowUserMutation } from "@/services/followerApi";


export function LikesItem({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserInfoQuery(userId);
  const { data: authedUser } = useGetAuthedUserInfoQuery();
  const [followUser] = useFollowUserMutation();
  const [unFollowUser] = useUnFollowUserMutation();
  const { data: isFollowing } = useIsFollowingQuery(userId, {
    skip: !authedUser?.id || authedUser.id === userId,
  });
  

  function handleProfileClick() {
    navigate(`/profile/${userId}`);
  }
  function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    followUser(userId);
  }
  function handleUnFollow(e: React.MouseEvent) {
    e.stopPropagation();
    unFollowUser(userId);
  }
  if (isLoading) return null;

  const isSelf = authedUser?.id === userId;
  const shouldShowFollowButton = !isSelf && isFollowing?.answer === false;
  const shouldShowUnFollowButton = !isSelf && isFollowing?.answer === true;

  return (
    <div
      className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-accent/40 hover:shadow-md"
      onClick={handleProfileClick}
    >
      <div className="min-w-0 flex-1">
        <UserInfo user={data?.user!} />
      </div>
      {shouldShowFollowButton && (
        <Button
          size="sm"
          className="shrink-0 rounded-full px-4"
          onClick={handleFollow}
        >
          Follow
        </Button>
      )}
      {shouldShowUnFollowButton && (
        <Button
          variant="destructive"
          size="sm"
          className="shrink-0 rounded-full px-4"
          onClick={handleUnFollow}
        >
          Unfollow
        </Button>
      )}
    </div>
  )
}
