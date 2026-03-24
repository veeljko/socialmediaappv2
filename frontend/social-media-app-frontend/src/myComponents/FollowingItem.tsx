import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";
import UserInfo from "./UserInfo";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUnFollowUserMutation } from "@/services/followerApi";


export function FollowingItem({ userId }: { userId: string }) {
  const { profileId } = useParams();
  const {data : authedUser} = useGetAuthedUserInfoQuery();
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserInfoQuery(userId);
  const [unFollowUser] = useUnFollowUserMutation();

  const handleUnFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await unFollowUser(userId);
  }
  
  function handleProfileClick() {
    navigate(`/profile/${userId}`);
  }
  
  if (isLoading) return null;
  return (<div className="py-1 flex justify-between" onClick={handleProfileClick}>

    <UserInfo user={data?.user!} />
    {authedUser?.id === profileId && (
      <Button variant="destructive" size="sm" onClick={handleUnFollow}>
        Remove Following
      </Button>
    )}
  </div>)
}