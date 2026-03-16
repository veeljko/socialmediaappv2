import { useGetCommentsFromPostInfiniteQuery } from "@/services/commentApi";
import type { CommentCard } from "@/features/comment/types";
import { useState } from "react";
import type { Post } from "@/features/post/types";

export const useInfinityComments = ({post}: { post : Post }) => {
    const {data : comments, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetCommentsFromPostInfiniteQuery(post?._id, {skip : !post?._id });
    const [loadedComments, setLoadedComments] = useState(3);
    const loadMoreComments = (async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
            setLoadedComments((prev) => prev + 3);
        }
    });

    const allResults = comments?.pages;
    const allComments: CommentCard[] | undefined = allResults?.flatMap(result => result.comments);

    return {allComments, loadMoreComments, loadedComments};
}