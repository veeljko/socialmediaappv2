export interface Post {
  type: "post",
  _id: string,
  authorId: string,
  content: string,
  mediaUrls: Media[] | null,
  likesCount: number,
  commentsCount: number
}

export interface getPostResponse {
  posts: Post[],
  cursor: Post
}

interface Media {
  secure_url: string,
  public_id: string,
  type: string
}

export interface createPostRequest {
  media: File[] | null
  content: string,
}

export interface createPostResponse {
  message: string,
  post: Post
}

export interface isPostLikedByUserRequest {
  postId: string,
  userId: string
}

export interface isPostLikedByUserResposne {
  message: string,
  answer: boolean
}