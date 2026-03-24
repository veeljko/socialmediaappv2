export interface FollowUserResponse {
    message: string
}
export interface IsFollowing {
    message: string,
    answer: boolean
}
export interface FollowerRelation {
    _id: string,
    followerId: string,
    followingId: string
}
export interface GetFollowersResponse {
    followers: FollowerRelation[],
    cursor: FollowerRelation | string | null
}
export interface GetFollowingsResponse {
    followings: FollowerRelation[],
    cursor: FollowerRelation | string | null
}

