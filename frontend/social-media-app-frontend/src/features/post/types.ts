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