
import type { CommentCard } from "@/features/comment/types";
import {CommentDisplay} from "@/myComponents/CommentDisplay";

type PostCardProps = {
    comments : CommentCard[],
    loadMoreComments : () => void,
    loadedComments : number,
    className? : string,
    commentsCount : number
};

function CommentSection({ comments, loadMoreComments, loadedComments, commentsCount }: PostCardProps) {

  
    return <div>
        {comments?.map((comment) => 
          <CommentDisplay key={comment._id} comment={comment} />
        )}
        {loadedComments < commentsCount && (
            <button onClick={loadMoreComments} className="w-full py-2 text-center text-blue-500 hover:text-blue-700">View {commentsCount - loadedComments} more comments</button>
        )}

    </div>
}

export default CommentSection;
