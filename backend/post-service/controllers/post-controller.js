const StatusCodes = require("http-status-codes");
const Post = require("../models/post-model");
const PostLike = require("../models/post-like-model");

const {winstonLogger} = require("../utils/logger/winstonLogger");
const {publishEvent} = require("../utils/rabbitmq");

const { uploadImage, deleteMedia } = require("../utils/cloudinaryUploader");

const createPost = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const media = [];

    for (const file of req.files) {
        const ans = await uploadImage(file.buffer);

        media.push({
            secure_url: ans.secure_url,
            public_id: ans.public_id,
            type: "image",
        });
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
        winstonLogger.info("Creating post with these specs", {...newPost});
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
};
const deletePost = async (req, res) => {
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



    await Promise.all(
        targetPost.mediaUrls.map(m => deleteMedia(m.public_id))
    );

    await publishEvent("post.deleted", {
        postId,
    });
    await targetPost.deleteOne();
    winstonLogger.info("Successfully deleted post");
    return res.status(200).send({
        message: "Post deleted successfully!",
    })
}
const likePost = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const postId = req.params.postId;

        if (!userId || !postId) {
            return res.status(400).json({ message: "Missing data" });
        }

        let newPostLike;
        try {
            newPostLike = await PostLike.create({
                userId,
                postId,
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({
                    message: "Post already liked by user",
                });
            }
            throw err;
        }

        const targetPost = await Post.findByIdAndUpdate(
            postId,
            { $inc: { likesCount: 1 } },
            { new: true }
        );

        if (!targetPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        winstonLogger.info("Post liked successfully", {
            userId,
            postId
        });

        await publishEvent("post.liked", {
            postId,
            authorId: targetPost.authorId,
            userId
        });

        return res.status(200).json({
            message: "Post liked successfully!",
        });

    } catch (err) {
        winstonLogger.error("Error while liking post", {
            error: err.message
        });

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
const unlikePost = async (req, res) => {
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
}
const deleteAllPostsByUser = async (req, res) => {
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
}
const deleteAllLikesByUser = async (req, res) => {
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
}
const getPostsByUser = async (req, res) => {
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
}
const getPosts = async (req, res) => {
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
}
const updatePost = async (req, res) => {
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
        const ans = await uploadImage(file.buffer); 

        media.push({
            secure_url: ans.secure_url,
            public_id: ans.public_id,
            type: "image",
        });
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
}
const getPostInfo = async (req, res) => {
    const postId = req.params.postId;
    const targetPost = await Post.findById(postId);
    if (!targetPost){
        winstonLogger.error("Could not find post with postId");
        return res.status(404).send({
            message: "Could not find post with postId"
        })
    }
    return res.status(202).send({
        ...targetPost._doc,
    });
}
const isPostLikedByUser = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.params.userId;
    const target = await PostLike.find({userId, postId});
    // winstonLogger.info("IsPostLikedByUser", {target});
    if (target.length) return res.status(200).send({ message : "User has liked specified post", answer : true});
    return res.status(200).send({ message : "User has not liked specified post", answer : false});
}

module.exports = {
    createPost,
    deletePost,
    likePost,
    unlikePost,
    deleteAllPostsByUser,
    deleteAllLikesByUser,
    getPostsByUser,
    getPosts,
    updatePost,
    getPostInfo,
    isPostLikedByUser
}