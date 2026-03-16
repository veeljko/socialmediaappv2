interface Media{
    secure_url : string,
    public_id : string,
    type : string
}

export interface getCommentsFromPostResponse{
    comments : CommentCard[],
    cursor : CommentCard
}

export interface getCommentsFromPostRequest{
    postId : string,
    cursor? : string
}

export interface CommentCard {
  _id : string,
  postId : string,
  authorId : string,
  content : string,
  parentId? : string,
  likesCount? : number | 0,
  repliesCount? : number | 0,
  mediaUrl? : Media | null,
  createdAt : string,
  updatedAt : string,
}

export interface isCommentLikedByUserRequest{
    commentId : string,
    userId : string
}

export interface isCommentLikedByUserResponse{
    message : string,
    answer : boolean
}