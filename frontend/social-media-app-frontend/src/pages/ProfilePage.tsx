import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { Settings } from "lucide-react";
import type { Post } from "@/features/post/types";
import { useInfiniteScroll } from "@/hooks/infiniteScroll";
import { useParams } from "react-router-dom";
import { useGetUserInfoQuery } from "../services/authApi";
import { Button } from "@/components/ui/button";
import { useFollowUserMutation, useIsFollowingQuery, useUnFollowUserMutation } from "@/services/followerApi";
import { useGetPostsByUserQuery } from "@/services/postApi";
import { useEffect, useState } from "react";
import { PostCard } from "@/myComponents/PostCard";

export default function ProfilePage() {
    const { profileId } = useParams();
    const { data: userData } = useGetUserInfoQuery(profileId || "", {skip : !profileId});
    const { data: isFollowing } = useIsFollowingQuery(profileId || "", {skip : !profileId});
    const [posts, setPosts] = useState<Post[]>([]);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const { data: newPosts, isFetching : isFetchingPosts } = useGetPostsByUserQuery({ userId: profileId || "", cursor }, {skip : !profileId});

    const [followUser] = useFollowUserMutation();
    const [unFollowUser] = useUnFollowUserMutation();

    const authedUser = useAppSelector((s) => s.auth.user);
    const user = userData?.user;

    const isAuthedUser: boolean = (authedUser?.id === user?.id);


    const handleFollow = async (e: React.MouseEvent) => {
        // console.log(isAuthedUser, authedUser?.id, user?.id);
        // console.log(user);
        e.preventDefault();
        if (isFollowing?.answer === true) await unFollowUser(profileId || "");
        else await followUser(profileId || "");
        //console.log(isFollowing)
    }

    useEffect(() => {
        if (newPosts) setPosts((prev) => [...prev, ...newPosts.posts]);
        console.log(newPosts);
    }, [newPosts])

    const loadMore = () => {
        if (isFetchingPosts) return;
        if (!newPosts?.cursor?._id) return;
        
        setCursor(newPosts.cursor._id);
        // if (newPosts) setPosts((prev) => [...prev, ...newPosts.posts]);
    };

    const loadMoreRef = useInfiniteScroll(loadMore);

    // if (isLoading) return <p>LOADING DATA</p>;
    // if (error) return <p>{error.toString()}</p>

    return (<div className="flex flex-col">
        <div className="flex mt-10 gap-10 border-3 p-4 rounded-4xl shadow-xl hover:shadow-2xl">
            <Avatar size="userprofile" className="data:size-90" >
                <AvatarImage
                    src={user?.avatar?.secure_url || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItaWNvbiBsdWNpZGUtdXNlciI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4="}
                    alt="@shadcn"
                    className=""
                />
                <AvatarFallback>Avatar</AvatarFallback>
            </Avatar>
            <div className="flex flex-col w-full pt-4 relative">
                <p className="text-3xl font-medium leading-none pb-1.5">{user?.firstName} {user?.lastName}</p>
                <p className="text-xl font-light leading-none">{user?.username}</p>
                <div className="absolute bottom">

                </div>
                <div className="absolute bottom-2 flex gap-5">
                    <p>Followers {user?.followersCount}</p>
                    <p>Followings {user?.followingCount}</p>
                </div>
            </div>
            <div className="flex flex-col justify-between items-center">
                <Settings />
                {!isAuthedUser &&
                    <Button variant="default" className="" onClick={handleFollow}>{isFollowing?.answer ? "Unfollow" : "Follow"}</Button>
                }
            </div>
        </div>
        {posts?.map((post, index) => (
            <PostCard
                key={index}
                postId={post._id}
                onLike={(id) => console.log("like", id)}
                onComment={(id) => console.log("comment", id)}
            />
        ))}
        {cursor !== "LACK_OF_POSTS" ? <div ref={loadMoreRef} /> : <div className="flex justify-center border-1 rounded-2xl my-6 py-2 inset-shadow-2xs inset-shadow-indigo-200">
            <p className="font-light fade-out-translate-full">That's it for now, come back later!</p>
        </div>}
    </div>)
}

