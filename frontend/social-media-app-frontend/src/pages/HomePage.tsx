import CreatePost from "@/myComponents/CreatePost";
import { useInfinityPosts } from "@/hooks/infinityPosts";
import PostCardImplementation from "@/myComponents/FeedPostCardImplementation";
import { HomePageHeader } from "@/myComponents/HomePageHeader";
import { EndOfPosts } from "@/myComponents/EndOfPosts";

function HomePage() {
    const {allPosts, loadMoreRef} = useInfinityPosts();

    return (<div>
        <HomePageHeader defaultValue="foryou">
            <HomePageHeader.Tab title={"For You"} value={"foryou"}/>
            <HomePageHeader.Tab title={"My Followings"} value={"myfollowings"}/>
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