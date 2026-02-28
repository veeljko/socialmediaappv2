import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Post } from "./types";

interface PostState {
  feed: Post[];
}

const initialState: PostState = {
  feed: [],
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.feed = action.payload;
    },

    addPosts: (state, action: PayloadAction<Post[]>) => {
      state.feed.push(...action.payload);
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.feed = state.feed.filter(
        (post) => post._id !== action.payload
      );
    },
  },
});

export const { setPosts, addPosts, removePost } = postSlice.actions;
export default postSlice.reducer;