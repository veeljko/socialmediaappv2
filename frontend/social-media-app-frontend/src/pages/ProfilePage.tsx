import { Settings } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PostCard from "@/myComponents/PostCard";
import { useGetUserInfoQuery } from "@/services/authApi";
import { useInfinityUserPosts } from "@/hooks/infinityUserPosts";
import { useFollowUser } from "@/hooks/followUser";
import { useCheckIsAuthedsProfile } from "@/hooks/checkIsAuthedsPorifle";
import { UserAvatar } from "@/myComponents/UserAvatar";

export default function ProfilePage() {
    const params = useParams();
    
    const { data: profileData } = useGetUserInfoQuery(params.profileId || "", {skip : !params.profileId})
    const {allPosts, loadMoreRef} = useInfinityUserPosts({profileId : profileData?.user.id});
    const {isAuthedUser} = useCheckIsAuthedsProfile({profileId : profileData?.user.id});
    const {handleFollow, isFollowing} = useFollowUser({profileId : profileData?.user.id});
    
    return (<div className="flex flex-col">
        <div className="flex mt-10 gap-10 border-3 p-4 rounded-4xl shadow-xl hover:shadow-2xl">
            <UserAvatar profileData={profileData?.user}/>
            <div className="flex flex-col w-full pt-4 relative">
                <p className="text-3xl font-medium leading-none pb-1.5">{profileData?.user.firstName} {profileData?.user.lastName}</p>
                <p className="text-xl font-light leading-none">{profileData?.user.username}</p>
                <div className="absolute bottom">

                </div>
                <div className="absolute bottom-2 flex gap-5">
                    <p>Followers {profileData?.user.followersCount}</p>
                    <p>Followings {profileData?.user.followingCount}</p>
                </div>
            </div>
            <div className="flex flex-col justify-between items-center">
                <Settings />
                {!isAuthedUser &&
                    <Button variant="default" className="" onClick={handleFollow}>{isFollowing ? "Unfollow" : "Follow"}</Button>
                }
            </div>
        </div>
        {allPosts?.map((post) => (
            <PostCard
                key={post._id}
                post={post}
            />
        ))}
        <div ref={loadMoreRef} /> 
        <div className="flex justify-center border rounded-2xl my-6 py-2 inset-shadow-2xs inset-shadow-indigo-200">
            <p className="font-light fade-out-translate-full">That's it for now, come back later!</p>
        </div>
    </div>)
}

