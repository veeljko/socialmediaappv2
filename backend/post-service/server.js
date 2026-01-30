require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const app = express();
const Post = require("./models/post-model");
const PostLike = require("./models/post-like-model");
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
        userId: userId,
    })){
        return res.status(200).send({
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

mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("PostService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

const port = process.env.POST_SERVICE_PORT || 3002;
app.listen(port, ()=>
    winstonLogger.info("Post service listening on port " + port)
);