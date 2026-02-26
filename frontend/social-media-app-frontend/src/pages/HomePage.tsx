import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePost from "@/myComponents/CreatePost";
import { PostCard } from "@/myComponents/PostCard";
import { useGetPostsQuery } from "@/services/postApi";
import { addPosts } from "@/features/post/postSlice"
import { useEffect, useState } from "react";
import { useInfiniteScroll } from "@/hooks/infiniteScroll";

function HomePage() {
    const dispatch = useAppDispatch();
    const posts = useAppSelector((s) => s.post.feed);

    const [cursor, setCursor] = useState<string | undefined>(
        posts.at(posts.length-1)?._id || undefined
    );
    const { data, isFetching } = useGetPostsQuery(cursor);

    const loadMore = () => {
        if (isFetching) return;
        if (!data?.cursor?._id) return;
        
        setCursor(data.cursor._id);
    };

    const loadMoreRef = useInfiniteScroll(loadMore);

    useEffect(() => {
        if (!data) return;

        dispatch(addPosts(data.posts));

        if (!data.posts.length) {
            setCursor("LACK_OF_POSTS");
        }
    }, [data, dispatch]);

    useEffect(() => {
        console.log(posts);
    }, [])

    return (<div>
        <Tabs defaultValue="foryou">
            <TabsList variant="line" className="flex justify-between w-full">
                <TabsTrigger value="foryou">For You</TabsTrigger>
                <TabsTrigger value="myfollowings">My Followings</TabsTrigger>
            </TabsList>
        </Tabs>
        <CreatePost />
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
    </div>);
}

export default HomePage;