import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePost from "@/myComponents/CreatePost";
import PostCard from "@/myComponents/PostCard";
import { useInfinityPosts } from "@/hooks/infinityPosts";

function HomePage() {
    const {allPosts, loadMoreRef} = useInfinityPosts();

    return (<div>
        <Tabs defaultValue="foryou">
            <TabsList variant="line" className="flex justify-between w-full">
                <TabsTrigger value="foryou">For You</TabsTrigger>
                <TabsTrigger value="myfollowings">My Followings</TabsTrigger>
            </TabsList>
        </Tabs>
        <CreatePost />
        {allPosts?.map((post) => (
            <PostCard
                key={post._id}
                post={post}
            />
        ))}

        <div ref={loadMoreRef} /> : <div className="flex justify-center border rounded-2xl my-6 py-2 inset-shadow-2xs inset-shadow-indigo-200">
            <p className="font-light fade-out-translate-full">That's it for now, come back later!</p>
        </div>
    </div>);
}

export default HomePage;