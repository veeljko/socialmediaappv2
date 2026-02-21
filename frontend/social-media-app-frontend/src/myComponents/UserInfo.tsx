import { Link } from "react-router-dom";
import {User} from "lucide-react"

interface userInfo {
    username : String,
    name : String,
    lastname : String,
}

export default function UserInfo(userInfo : userInfo) {
  

  return (
    <div className="flex items-center gap-5">
      <User className="h-12 w-12 rounded-full"/>
      <div className="">
        <p className="font-semibold">{userInfo.name} {userInfo.lastname}</p>
        <p>{userInfo.username}</p>
      </div>
    </div>
  )
}