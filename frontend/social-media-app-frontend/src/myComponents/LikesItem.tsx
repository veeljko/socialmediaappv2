import { useGetUserInfoQuery } from "@/services/authApi";
import UserInfo from "./UserInfo";
import { useNavigate } from "react-router-dom";


export function LikesItem({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUserInfoQuery(userId);
  

  function handleProfileClick() {
    navigate(`/profile/${userId}`);
  }
  if (isLoading) return null;
  return (<div className="py-1 flex justify-between" onClick={handleProfileClick}>
    <UserInfo user={data?.user!} />
  </div>)
}