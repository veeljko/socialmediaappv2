import CreatePost from "@/myComponents/postCard/CreatePost";
import { useInfinityPosts } from "@/hooks/infinityPosts";
import { useInfinityFollowingFeed } from "@/hooks/infinityFollowingFeed";
import PostCardImplementation from "@/myComponents/postCard/FeedPostCardImplementation";
import { HomePageHeader } from "@/myComponents/HomePageHeader";
import { EndOfPosts } from "@/myComponents/postCard/EndOfPosts";
import { useState } from "react";

function HomePage() {
    const [activeTab, setActiveTab] = useState<"foryou" | "myfollowings">("foryou");
    const {allPosts: allForYouPosts, loadMoreRef: forYouLoadMoreRef} = useInfinityPosts(activeTab === "foryou");
    const {allPosts: allFollowingPosts, loadMoreRef: followingLoadMoreRef} = useInfinityFollowingFeed(activeTab === "myfollowings");

    const allPosts = activeTab === "foryou" ? allForYouPosts : allFollowingPosts;
    const loadMoreRef = activeTab === "foryou" ? forYouLoadMoreRef : followingLoadMoreRef;

    return (<div>
        <HomePageHeader value={activeTab}>
            <HomePageHeader.Tab title={"For You"} value={"foryou"} onClick={() => setActiveTab("foryou")}/>
            <HomePageHeader.Tab title={"My Followings"} value={"myfollowings"} onClick={() => setActiveTab("myfollowings")}/>
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
