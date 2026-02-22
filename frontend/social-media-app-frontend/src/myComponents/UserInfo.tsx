import { Link } from "react-router-dom";
import {User} from "lucide-react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"

interface userInfo {
    username : String,
    name : String,
    lastname : String,
}

export default function UserInfo(userInfo : userInfo) {
  

  return (
    <div className="flex items-center gap-5">
      <Avatar size="lg">
        <AvatarImage
          src="https://github.com/shadcn.png"
          alt="@shadcn"
          className="grayscale"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="">
        <p className="font-semibold">{userInfo.name} {userInfo.lastname}</p>
        <p>{userInfo.username}</p>
      </div>
    </div>
  )
}