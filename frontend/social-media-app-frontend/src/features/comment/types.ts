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

export interface createCommentRequest {
    postId: string
    formData: FormData
}

export interface createCommentResponse {
    message: string
}

export interface createCommentToCommentRequest {
    commentId: string
    formData: FormData
}
export type createCommentToCommentResponse = createCommentResponse

export interface getCommentByIdResponse {
    comment: CommentCard
}

export interface getCommentsFromCommentResponse{
    comments : CommentCard[],
    cursor : CommentCard
}
