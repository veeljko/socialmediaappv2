
import { useParams } from "react-router-dom";
import { useGetUserInfoQuery } from "@/services/authApi";
import { useInfinityUserPosts } from "@/hooks/infinityUserPosts";
import { useFollowUser } from "@/hooks/followUser";
import { useCheckIsAuthedsProfile } from "@/hooks/checkIsAuthedsPorifle";
import PostCardImplementation from "@/myComponents/FeedPostCardImplementation";
import { EndOfPosts } from "@/myComponents/EndOfPosts";
import { AvatarCard } from "@/myComponents/AvatarCard";

export default function ProfilePage() {
    const params = useParams();
    
    const { data: profileData } = useGetUserInfoQuery(params.profileId || "")
    const {allPosts, loadMoreRef} = useInfinityUserPosts({profileId : profileData?.user.id});
    const {isAuthedUser} = useCheckIsAuthedsProfile({profileId : profileData?.user.id});
    const {handleFollow, isFollowing} = useFollowUser({profileId : profileData?.user.id});
    
    if (!profileData) return null;
    return (
    <div className="flex flex-col">
        <AvatarCard profileData={profileData.user}>
            {!isAuthedUser && 
                <AvatarCard.FollowButton isActive={isFollowing} onClick={handleFollow}/>
            }
        </AvatarCard>


        {allPosts?.map((post) => (
            <PostCardImplementation
                key={post._id}
                post={post}
            />
        ))}


        <EndOfPosts loadMoreRef={loadMoreRef}/>
    </div>)
}

