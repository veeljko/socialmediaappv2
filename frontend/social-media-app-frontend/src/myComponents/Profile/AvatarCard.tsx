import type { User } from "@/features/auth/types"
import { UserAvatar } from "./UserAvatar"
import { Settings, Users, UserRoundPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface AvatarCardProps {
    profileData: User,
    children?: ReactNode,
    setIsFollowersOpen?: (isOpen: boolean) => void,
    setIsFollowingsOpen?: (isOpen: boolean) => void,
}

export const AvatarCard = ({ profileData, children, setIsFollowersOpen, setIsFollowingsOpen }: AvatarCardProps) => {
    return (<div className="flex mt-10 gap-10 border-3 p-4 rounded-4xl shadow-xl hover:shadow-2xl">
        <UserAvatar profileData={profileData} size="userprofile" />
        <div className="flex flex-col w-full pt-4 relative">
            <p className="text-3xl font-medium leading-none pb-1.5">{profileData.firstName} {profileData.lastName}</p>
            <p className="text-xl font-light leading-none">{profileData.username}</p>
            <div className="absolute bottom">

            </div>
            <div className="absolute bottom-2 flex gap-3">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setIsFollowersOpen && setIsFollowersOpen(true)}
                >
                    <Users size={16} />
                    <span>Followers</span>
                    <span className="text-muted-foreground">{profileData.followersCount ?? 0}</span>
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setIsFollowingsOpen && setIsFollowingsOpen(true)}
                >
                    <UserRoundPlus size={16} />
                    <span>Followings</span>
                    <span className="text-muted-foreground">{profileData.followingCount ?? 0}</span>
                </button>
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
