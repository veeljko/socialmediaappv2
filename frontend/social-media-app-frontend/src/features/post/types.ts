export interface Post{
    _id : string,
    authorId : string,
    content : string,
    mediaUrls : Media[] | null, 
    likesCount : number,
    commentCount : number
}

export interface getPostResponse{
    posts : Post[],
    cursor : Post
}

interface Media{
    secure_url : string,
    public_id : string,
    type : string
}

export interface createPostRequest{
    media : File[] | null
    content : string,
}

export interface createPostResponse{
    message : string
}

export interface isPostLikedByUserRequest{
    postId : string,
    userId : string
}

export interface isPostLikedByUserResposne{
    message : string,
    answer : boolean
}