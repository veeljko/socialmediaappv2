import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import UserInfo from "./UserInfo";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRemoveFollowerMutation } from "@/services/followerApi";


export function FollowerItem({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { profileId } = useParams();
  const { data, isLoading } = useGetUserInfoQuery(userId);
  const [removeFollower] = useRemoveFollowerMutation();
  const { data: authedUser } = useGetAuthedUserInfoQuery();

  function handleProfileClick() {
    navigate(`/profile/${userId}`);
  }

  function handleRemoveFollower(e: React.MouseEvent) {
    e.stopPropagation();
    removeFollower(userId);
  }

  if (isLoading) return null;
  return (<div className="py-1 flex justify-between" onClick={handleProfileClick}>

    <UserInfo user={data?.user!} />
    {authedUser?.id === profileId && (
      <Button variant="destructive" size="sm" onClick={handleRemoveFollower}>
        Remove Follower
      </Button>
    )}
  </div>)
}