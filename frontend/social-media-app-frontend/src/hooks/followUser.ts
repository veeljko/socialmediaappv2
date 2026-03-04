import { useFollowUserMutation, useIsFollowingQuery, useUnFollowUserMutation } from "@/services/followerApi";


export const useFollowUser = ({profileId} : {profileId : string | undefined}) => {
    const { data: isFollowing } = useIsFollowingQuery(profileId || "", {skip : !profileId});
    const [followUser] = useFollowUserMutation();
    const [unFollowUser] = useUnFollowUserMutation();
    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFollowing?.answer === true) await unFollowUser(profileId || "");
        else await followUser(profileId || "");
    }
    return {handleFollow, isFollowing : isFollowing?.answer}
}