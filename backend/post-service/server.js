require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const app = express();
const Post = require("./models/post-model");
const PostLike = require("./models/post-like-model");

const mongodbconnect = require("./utils/mongodbconnect");
const {connectToRabbitMq} = require("./utils/rabbitmq");

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
        const posts = await Post.find({authorId: userId});
        for (const post of posts){
            if (post.mediaUrls){
                for (const media of post.mediaUrls){
                    await deleteMedia(media.public_id)
                }
            }
            await Post.findByIdAndDelete(post._id);
        }
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

app.get("/get-posts-by-user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const cursor = req.query.cursor;
    let limit = req.query.limit;
    if (limit) limit = parseInt(limit);
    else limit = 5;

    if (cursor){
        const ans = await Post.find({
            authorId : userId,
            _id : {$gt : cursor}
        }).sort({ _id : 1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find posts with userId");
            return res.status(404).send({
                message: "Could not find posts with userId"
            })
        }

        const newCursor = Object.values(ans).at(-1);
        return res.status(200).send({
            posts: ans,
            cursor : newCursor
        })
    }
    else{
        const ans = await Post.find({
            authorId : userId,
        }).sort({_id : 1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find post with userId");
            return res.status(404).send({
                message: "Could not find post with userId"
            })
        }

        const cursor = Object.values(ans).at(-1);
        return res.status(200).send({
            posts : ans,
            cursor : cursor
        })
    }
})

app.get("/get-posts/", async (req, res) => {
    const cursor = req.query.cursor;
    let limit = req.query.limit;
    if (limit) limit = parseInt(limit);
    else limit = 5;

    if (cursor){
        const ans = await Post.find({
            _id : {$lt : cursor}
        }).sort({ _id : -1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find posts");
            return res.status(404).send({
                message: "Could not find posts"
            })
        }

        const newCursor = Object.values(ans).at(-1);
        return res.status(200).send({
            posts: ans,
            cursor : newCursor
        })
    }
    else{
        const ans = await Post.find({

        }).sort({_id : -1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find post");
            return res.status(404).send({
                message: "Could not find post"
            })
        }

        const cursor = Object.values(ans).at(-1);
        return res.status(200).send({
            posts : ans,
            cursor : cursor
        })
    }
})

app.put("/update-post/:postId", upload.array("media"), async (req, res) => {
    const userId = req.headers['x-user-id'];
    const postId = req.params.postId;

    const targetPost = await Post.findById(postId);
    if (!targetPost){
        winstonLogger.error("Could not find post with postId");
        return res.status(404).send({
            message: "Could not find post with postId"
        })
    }
    if (targetPost.authorId.toString() !== userId){
        winstonLogger.error("User cant edit that post");
        return res.status(403).send({
            message: "User cant edit that post"
        })
    }

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
    targetPost.content = req.body.content;
    targetPost.mediaUrls = media;
    await targetPost.save();
    return res.status(200).send({
        message: "Post updated successfully"
    })
})


mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("PostService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

async function startServer(){
    try{
        await connectToRabbitMq();
        const port = process.env.POST_SERVICE_PORT || 3003;
        app.listen(port, ()=>
            winstonLogger.info("Post service listening on port " + port)
        );
    }
    catch(err){
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}
startServer();