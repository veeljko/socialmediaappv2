import { useOptimistic } from "react";
import type { Post } from "@/features/post/types";

export const getUseOptimisticPost = (post : Post) => {
    const [optimisticPost, toggleLikeOptimistic] = useOptimistic(post, (state, action: "like" | "unlike") => {
        if (action === "like") {
            return {
                ...state,
                isLiked: true,
                likesCount: state.likesCount + 1,
            };
        }

        return {
            ...state,
            isLiked: false,
            likesCount: state.likesCount - 1,
        };
    });
    return {optimisticPost, toggleLikeOptimistic};
}
