import type { User } from "@/features/auth/types"
import { UserAvatar } from "./UserAvatar";

export default function UserInfo({user} : {user : User}) {
  return (
    <div className="flex items-center gap-5">
      <UserAvatar profileData={user} size="lg"/>
      <div className="">
        <p className="font-semibold">{user.firstName || ""} {user.lastName || ""}</p>
        <p>{user.username}</p>
      </div>
    </div>
  )
}