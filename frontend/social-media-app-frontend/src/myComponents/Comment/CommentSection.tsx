
import type { CommentCard } from "@/features/comment/types";
import {CommentDisplay} from "@/myComponents/Comment/CommentDisplay";

type PostCardProps = {
    comments : CommentCard[],
    loadMoreComments : () => void,
    loadedComments : number,
    className? : string,
    commentsCount : number,
    hasNextPage : boolean
};

function CommentSection({ comments, loadMoreComments, loadedComments: _loadedComments, commentsCount: _commentsCount, hasNextPage }: PostCardProps) {

  
    return <div>
        {comments?.map((comment) => 
          <CommentDisplay key={comment._id} comment={comment} />
        )}
        {hasNextPage && (
            <button onClick={loadMoreComments} className="w-full py-2 text-center text-blue-500 hover:text-blue-700">View more comments</button>
        )}

    </div>
}

export default CommentSection;
