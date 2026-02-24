import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePost from "@/myComponents/CreatePost";
import { PostCard } from "@/myComponents/PostCard";
import { useGetPostsQuery } from "@/services/postApi";
import { addPosts, setPosts } from "@/features/post/postSlice"
import { useEffect, useState, useMemo } from "react";
import { useInfiniteScroll } from "@/hooks/infiniteScroll";
import React from "react";

interface HomePageProps {
    cursor : string | undefined,
    setCursor : (cursor : string | undefined) => void,
}

function HomePage({cursor, setCursor} : HomePageProps) {
    const dispatch = useAppDispatch();
    const posts = useAppSelector((s) => s.post.feed);
    const { data, isFetching } = useGetPostsQuery(cursor);


    const loadMore = () => {
        if (data?.cursor && !isFetching) {
            setCursor(data?.cursor._id);
        }
    };

    const loadMoreRef = useInfiniteScroll(loadMore);

    useEffect(() => {
        if (!data?.posts?.length) return;
        if (cursor === undefined) {
            dispatch(setPosts(data.posts));
        } else {
            dispatch(addPosts(data.posts));
        }
    }, [cursor]);


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
                post={post}
                onLike={(id) => console.log("like", id)}
                onComment={(id) => console.log("comment", id)}
            />
        ))}
        {isFetching && <p>Loading posts...</p>}
        <div ref={loadMoreRef} />
    </div>);
}

export default HomePage;