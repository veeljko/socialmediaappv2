import type { User } from "@/features/auth/types"
import { UserAvatar } from "./UserAvatar"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface AvatarCardProps {
    profileData: User,
    children?: ReactNode,
}

export const AvatarCard = ({ profileData, children }: AvatarCardProps) => {
    return (<div className="flex mt-10 gap-10 border-3 p-4 rounded-4xl shadow-xl hover:shadow-2xl">
        <UserAvatar profileData={profileData} size="userprofile" />
        <div className="flex flex-col w-full pt-4 relative">
            <p className="text-3xl font-medium leading-none pb-1.5">{profileData.firstName} {profileData.lastName}</p>
            <p className="text-xl font-light leading-none">{profileData.username}</p>
            <div className="absolute bottom">

            </div>
            <div className="absolute bottom-2 flex gap-5">
                <p>Followers {profileData.followersCount}</p>
                <p>Followings {profileData.followingCount}</p>
            </div>
        </div>
        <div className="flex flex-col justify-between items-center">
            <Settings />
            {children}
        </div>
    </div>)
}

interface FollowButtonProps {
    onClick? : (e: React.MouseEvent<Element, MouseEvent>) => Promise<void>
    isActive? : boolean,
}

AvatarCard.FollowButton = function AvatarCardFollowButton({onClick, isActive} : FollowButtonProps) {
    return <>
        <Button variant="default" onClick={onClick}>{isActive ? "Unfollow" : "Follow"}</Button>
    </>
}