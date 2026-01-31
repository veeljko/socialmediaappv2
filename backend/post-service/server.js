require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const app = express();
const Post = require("./models/post-model");
const PostLike = require("./models/post-like-model");
const CommentLike = require("./models/comment-like-model");
const Comment = require("./models/comment-model");
const mongodbconnect = require("./utils/mongodbconnect");

const multer = require("multer");
const upload = new multer();

const {winstonLogger} = require("./utils/logger/winstonLogger");
const helmet = require("helmet");
const { morganMiddleware } = require("./middlewares/morganLogger");

const { uploadImage, deleteMedia } = require("./utils/cloudinaryUploader");

app.use(helmet());
app.use(morganMiddleware);

app.post("/create-post", upload.array("media"), async (req, res) => {
    const userId = req.headers["x-user-id"];
    const media = [];
    for (const file of req.files) {
        const ans = await uploadImage(req.files[0].buffer);
        media.push({
            secure_url: ans.secure_url,
            public_id: ans.public_id,
            type: "image",
        })
    }
    if (!req.body.content && media.length === 0) {
        return res.status(400).json({ message: "Post cannot be empty" });
    }

    try {
        const newPost = await Post.create({
            authorId: userId,
            content: req.body.content,
            mediaUrls: media,
        })

        await newPost.save();
        return res.status(200).send({
            message: "Post created successfully!",
        })
    }
    catch (err) {
        winstonLogger.error("Error while creating the post", err);
        res.status(400).send({
            message: "Error while creating the post",
        })
    }
});

app.delete("/delete-post/:postId", async (req, res) => {
    const postId = req.params.postId;
    const userId = req.headers["x-user-id"];

    const targetPost = await Post.findById(postId);
    if (!targetPost) {
        winstonLogger.error("Error deleting post, post not found", postId);
        return res.status(404).send({
            message: "Post not found",
        })
    }

    if (userId !== targetPost.authorId.toString()){
        winstonLogger.error("Error deleting post, post's author is different than user", userId);
        return res.status(400).send({
            message: "Error deleting post",
        })
    }

    for (const post of targetPost.mediaUrls) {
        await deleteMedia(post.public_id)
    }

    await targetPost.deleteOne();
    winstonLogger.info("Successfully deleted post");
    return res.status(200).send({
        message: "Post deleted successfully!",
    })
})

app.post("/like-post/:postId", async (req, res) => {
    const userId = req.headers["x-user-id"];
    const postId = req.params.postId;

    if (await PostLike.findOne({
        postId: postId,
        userId: userId,})){
        return res.status(404).send({
            message: `Post is already liked by user`,
        })
    }

    const newPostLike = await PostLike.create({
        userId: userId,
        postId: postId,
    })

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } }
    )


    await newPostLike.save();
    winstonLogger.info("Successfully liked post");
    return res.status(200).send({
        message: "Post liked successfully!",
    })
})

app.delete("/unlike-post/:postId", async (req, res) => {
    const userId = req.headers["x-user-id"];
    const postId = req.params.postId;

    const postLike = await PostLike.findOne({
        postId: postId,
        userId: userId,
    });

    if (postLike){
        await postLike.deleteOne();
        winstonLogger.info("Successfully unlike the post");

        await Post.findByIdAndUpdate(
            postId,
            { $inc: { likesCount: -1 } }
        )

        return res.status(200).send({
            message: `Post is unliked by user successfully!`,
        })
    }
    return res.status(404).send({
        message: "Post is not liked by user",
    })
})

app.delete("/delete-all-posts-by-user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        await Post.deleteMany({authorId: userId});
        winstonLogger.info("Successfully deleted posts by", userId);
        return res.status(200).send({
            message: "Posts deleted successfully!",
        })
    }
    catch (err) {
        winstonLogger.error("Error deleting posts by user", err);
        res.status(400).send({
            message: "Error deleting posts by user",
        })
    }
})

app.delete("/delete-all-likes-by-user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        await PostLike.deleteMany({authorId: userId});
        winstonLogger.info("Successfully deleted likes by", userId);
        return res.status(200).send({
            message: "Likes deleted successfully!",
        })
    }
    catch (err) {
        winstonLogger.error("Error deleting likes by user", err);
        res.status(400).send({
            message: "Error deleting likes by user",
        })
    }
})

app.post("/add-comment-to-post/:postId", upload.array("media", 1), async (req, res) => {
    const userId = req.headers["x-user-id"];
    const postId = req.params.postId;
    let media = {};
    if (req.files[0]) {
        try{
            const ans = await uploadImage(req.files[0].buffer);
            media = {
                secure_url: ans.secure_url,
                public_id: ans.public_id,
                type: "image"
            }
        }
        catch (err) {
            winstonLogger.error("Error while uploading image", err);
            return res.status(400).send({
                message: "Error while adding comment to post",
            })
        }
    }
    try{
        const comment = await Comment.create({
            authorId : userId,
            postId : postId,
            content: req.body.content,
            mediaUrl : media,
        })

        await comment.save();
        return res.status(200).send({
            message: "Comment saved successfully!",
        })
    }
    catch (err) {
        winstonLogger.error("Error while adding comment", err);
        return res.status(400).send({
            message: "Error while adding comment",
        })
    }
})

app.post("/like-comment/:commentId", async (req, res) => {
    const userId = req.headers["x-user-id"];
    const commentId = req.params.commentId;

    if (await Comment.findOne({
        commentId: commentId,
        userId: userId,})){
        return res.status(404).send({
            message: `Comment is already liked by user`,
        })
    }

    const newCommentLike = await CommentLike.create({
        userId: userId,
        commentId: commentId,
    })

    await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { likesCount: 1 } }
    )

    await newCommentLike.save();
    winstonLogger.info("Successfully liked comment");
    return res.status(200).send({
        message: "Comment liked successfully!",
    })
})

app.post("/unlike-comment/:commentId", async (req, res) => {
    const userId = req.headers["x-user-id"];
    const commentId = req.params.commentId;

    const commentLike = await CommentLike.findOne({
        commentId: commentId,
        userId: userId,
    });

    if (commentLike){
        await commentLike.deleteOne();
        winstonLogger.info("Successfully unlike the comment");

        await Comment.findByIdAndUpdate(
            commentId,
            { $inc: { likesCount: -1 } }
        )

        return res.status(200).send({
            message: `Comment is unliked by user successfully!`,
        })
    }
    return res.status(404).send({
        message: "Comment is not liked by user",
    })
})

app.post("/add-comment-to-comment/:commentId", upload.array("media", 1), async (req, res) => {
    const userId = req.headers["x-user-id"];
    const commentId = req.params.commentId;
    let media = {};
    if (req.files[0]) {
        try{
            const ans = await uploadImage(req.files[0].buffer);
            media = {
                secure_url: ans.secure_url,
                public_id: ans.public_id,
                type: "image"
            }
        }
        catch (err) {
            winstonLogger.error("Error while uploading image", err);
            return res.status(400).send({
                message: "Error while adding comment to post",
            })
        }
    }
    let targetCommentId;
    let targetCommentDepth;
    let targetCommentPostId;
    try{
        const targetComment = await Comment.findByIdAndUpdate(
            commentId,
            { $inc: { commentsCount: 1 } }
        )
        targetCommentId = targetComment._id
        targetCommentDepth = targetComment.depth;
        targetCommentPostId = targetComment.postId;
    }
    catch (err) {
        winstonLogger.error("Error while increasing replies count", err);
        return res.status(400).send({
            message: "Error while adding comment to post",
        })
    }
    const newComment = await Comment.create({
        postId : targetCommentPostId,
        authorId : userId,
        content : req.body.content,
        mediaUrl : media,
        parentId : targetCommentId,
        depth : targetCommentDepth + 1,
    });

    await newComment.save();
    return res.status(200).send({
        message: "Comment saved successfully!",
    })
})

app.delete("/delete-comment/:commentId", async (req, res) => {
    const userId = req.headers["x-user-id"];
    const commentId = req.params.commentId;

    const targetComment = await Comment.findById(commentId)
    if (targetComment){
        if (userId !== targetComment.authorId.toString()){
            winstonLogger.error("Not auth user for that comment");
            return res.status(403).send({
                message: "Error while deleting comment",
            })
        }
        targetComment.isDeleted = true;
        targetComment.content = "";
        targetComment.mediaUrl = [];
        await targetComment.save();
        return res.status(200).send({
            message: "Comment deleted successfully!",
        })
    }
    winstonLogger.info("Successfully deleted comment");
    return res.status(404).send({
        message: "Comment not deleted successfully!",
    })
})

mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("PostService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

const port = process.env.POST_SERVICE_PORT || 3002;
app.listen(port, ()=>
    winstonLogger.info("Post service listening on port " + port)
);