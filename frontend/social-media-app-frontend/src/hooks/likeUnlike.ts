import type { Post } from "@/features/post/types";
import { useIsPostLikedByUserQuery, useLikePostMutation, useUnlikePostMutation } from "@/services/postApi";


export const useLikeUnlike = ({userId, post} : {userId : string | undefined, post : Post | undefined}) => {
    const { data: isLiked } = useIsPostLikedByUserQuery({userId : userId || "", postId : post?._id || ""}, {skip : !userId || !post});
    const [likePost] = useLikePostMutation();
    const [unlikePost] = useUnlikePostMutation();

    const handleLike = async () => {
        if (!post) return;
        if (!isLiked?.answer) await likePost(post);
        else await unlikePost(post);
    }

    return {handleLike, isLiked};
}