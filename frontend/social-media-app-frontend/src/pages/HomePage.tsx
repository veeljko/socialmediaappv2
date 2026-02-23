import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePost from "@/myComponents/CreatePost";
import { PostCard, type Post } from "@/myComponents/PostCard";

const post: Post = {
    id: "1",
    author: { name: "Name Lastname", username: "username" },
    createdAt: new Date().toISOString(),
    content: "Ovo je moj prvi post ✨",
    imageUrls: null,
    likeCount: 12,
    commentCount: 3,
    repostCount: 1,
    isLiked: false,
};

function HomePage(){
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);


    return (<div>
        <Tabs defaultValue="foryou">
        <TabsList variant="line" className="flex justify-between w-full">
            <TabsTrigger value="foryou">For You</TabsTrigger>
            <TabsTrigger value="myfollowings">My Followings</TabsTrigger>
        </TabsList>
        </Tabs>
        <CreatePost/>
        <PostCard
            post={post}
            onLike={(id) => console.log("like", id)}
            onComment={(id) => console.log("comment", id)}
        />
        <PostCard
            post={post}
            onLike={(id) => console.log("like", id)}
            onComment={(id) => console.log("comment", id)}
        />

    </div>);
}

export default HomePage;