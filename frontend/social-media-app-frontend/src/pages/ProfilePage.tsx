import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import type { Post } from "@/features/post/types";
import { useInfiniteScroll } from "@/hooks/infiniteScroll";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFollowUserMutation, useIsFollowingQuery, useUnFollowUserMutation } from "@/services/followerApi";
import { useGetPostsByUserInfiniteQuery } from "@/services/postApi";
import { PostCard } from "@/myComponents/PostCard";
import { useGetAuthedUserInfoQuery, useGetUserInfoQuery } from "@/services/authApi";

export default function ProfilePage() {
    const params = useParams();
    
    const { data: profileData } = useGetUserInfoQuery(params.profileId || "", {skip : !params.profileId})
    const {data : authedUser} = useGetAuthedUserInfoQuery();
    const { data: isFollowing } = useIsFollowingQuery(profileData?.user.id || "", {skip : !profileData?.user.id});
    const {data : posts, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetPostsByUserInfiniteQuery(profileData?.user.id || "", {skip : !profileData?.user.id});

    const [followUser] = useFollowUserMutation();
    const [unFollowUser] = useUnFollowUserMutation();
    const isAuthedUser: boolean = (authedUser?.id === profileData?.user.id);

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFollowing?.answer === true) await unFollowUser(profileData?.user.id || "");
        else await followUser(profileData?.user.id || "");
    }
    const loadMoreRef = useInfiniteScroll(async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
        }
    });

    const allResults = posts?.pages;
    const allPosts: Post[] | undefined = allResults?.flatMap(result => result.posts);
    // console.log(allPosts?.map(post => console.log(post)));

    return (<div className="flex flex-col">
        <div className="flex mt-10 gap-10 border-3 p-4 rounded-4xl shadow-xl hover:shadow-2xl">
            <Avatar size="userprofile" className="data:size-90" >
                <AvatarImage
                    src={profileData?.user.avatar?.secure_url || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItaWNvbiBsdWNpZGUtdXNlciI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4="}
                    alt="@shadcn"
                    className=""
                />
                <AvatarFallback>Avatar</AvatarFallback>
            </Avatar>
            <div className="flex flex-col w-full pt-4 relative">
                <p className="text-3xl font-medium leading-none pb-1.5">{profileData?.user.firstName} {profileData?.user.lastName}</p>
                <p className="text-xl font-light leading-none">{profileData?.user.username}</p>
                <div className="absolute bottom">

                </div>
                <div className="absolute bottom-2 flex gap-5">
                    <p>Followers {profileData?.user.followersCount}</p>
                    <p>Followings {profileData?.user.followingCount}</p>
                </div>
            </div>
            <div className="flex flex-col justify-between items-center">
                <Settings />
                {!isAuthedUser &&
                    <Button variant="default" className="" onClick={handleFollow}>{isFollowing?.answer ? "Unfollow" : "Follow"}</Button>
                }
            </div>
        </div>
        {allPosts?.map((post, index) => (
            <PostCard
                key={index}
                post={post}
                onLike={(id) => console.log("like", id)}
                onComment={(id) => console.log("comment", id)}
            />
        ))}
        <div ref={loadMoreRef} /> 
        <div className="flex justify-center border-1 rounded-2xl my-6 py-2 inset-shadow-2xs inset-shadow-indigo-200">
            <p className="font-light fade-out-translate-full">That's it for now, come back later!</p>
        </div>
    </div>)
}

