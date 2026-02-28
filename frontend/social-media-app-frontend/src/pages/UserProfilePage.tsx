import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { Settings } from "lucide-react";
import { useEffect } from "react";
import { useGetAuthedUserInfoQuery } from "../services/authApi";
import { setUser } from "@/features/auth/authSlice"
import { PostCard } from "@/myComponents/PostCard";

export default function UserProfilePage(){
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    
    const { data, isLoading } = useGetAuthedUserInfoQuery(undefined, {refetchOnFocus: true});

    useEffect(() => {
        if (data) dispatch(setUser(data));
    }, [data]);

    if (isLoading) return null;
    if (!user) return null;

    return (<div className="flex flex-col">
    <div className="flex mt-10 gap-10 border-3 p-4 rounded-4xl shadow-xl hover:shadow-2xl">
        <Avatar size="userprofile" className="data:size-90" >
            <AvatarImage
            src={user.avatar?.secure_url || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItaWNvbiBsdWNpZGUtdXNlciI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4="}
            alt="@shadcn"
            className=""
            />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col w-full pt-4 relative">
            <p className="text-3xl font-medium leading-none pb-1.5">{user.firstName} {user.lastName}</p>
            <p className="text-xl font-light leading-none">{user.username}</p>
            <div className="absolute bottom">
                
            </div>
            <div className="absolute bottom-2 flex gap-5">
                <p>Followers {user.followersCount}</p>
                <p>Followings {user.followingCount}</p>
            </div>
        </div>
        <div className="">
            <Settings/>
        </div>
        </div>
        {/* <PostCard
            post={post}
            onLike={(id) => console.log("like", id)}
            onComment={(id) => console.log("comment", id)}
        /> */}
    </div>)
}

