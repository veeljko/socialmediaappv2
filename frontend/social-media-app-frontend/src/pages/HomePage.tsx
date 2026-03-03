import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePost from "@/myComponents/CreatePost";
import { PostCard } from "@/myComponents/PostCard";
import { useGetPostsInfiniteQuery } from "@/services/postApi";
import { useInfiniteScroll } from "@/hooks/infiniteScroll";
import type { Post } from "@/features/post/types";

function HomePage() {
    const {data : posts, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetPostsInfiniteQuery(undefined);
    const loadMoreRef = useInfiniteScroll(async () => {
        if (hasNextPage && !isFetchingNextPage) {
            await fetchNextPage();
        }
    });

    const allResults = posts?.pages;
    const allPosts: Post[] | undefined = allResults?.flatMap(result => result.posts);
    return (<div>
        <Tabs defaultValue="foryou">
            <TabsList variant="line" className="flex justify-between w-full">
                <TabsTrigger value="foryou">For You</TabsTrigger>
                <TabsTrigger value="myfollowings">My Followings</TabsTrigger>
            </TabsList>
        </Tabs>
        <CreatePost />
        {allPosts?.map((post, index) => (
            <PostCard
                key={index}
                post={post}
                onLike={(id) => console.log("like", id)}
                onComment={(id) => console.log("comment", id)}
            />
        ))}

        <div ref={loadMoreRef} /> : <div className="flex justify-center border-1 rounded-2xl my-6 py-2 inset-shadow-2xs inset-shadow-indigo-200">
            <p className="font-light fade-out-translate-full">That's it for now, come back later!</p>
        </div>
    </div>);
}

export default HomePage;