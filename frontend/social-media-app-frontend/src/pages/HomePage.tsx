import CreatePost from "@/myComponents/CreatePost";
import { useInfinityPosts } from "@/hooks/infinityPosts";
import PostCardImplementation from "@/myComponents/PostCardImplementation";
import { HomePageHeader } from "@/myComponents/HomePageHeader";
import { EndOfPosts } from "@/myComponents/EndOfPosts";

function HomePage() {
    const {allPosts, loadMoreRef} = useInfinityPosts();

    return (<div>
        <HomePageHeader>
            <HomePageHeader.Tab title={"For You"}/>
            <HomePageHeader.Tab title={"My Followings"}/>
        </HomePageHeader>

        <CreatePost />
        
        {allPosts?.map((post) => (
            <PostCardImplementation
                key={post._id}
                post={post}
            />
        ))}

        <EndOfPosts loadMoreRef={loadMoreRef}/>
    </div>);
}

export default HomePage;