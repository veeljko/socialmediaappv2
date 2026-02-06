const Post = require("../models/post-model");
const PostLike = require("../models/post-like-model");
const {deleteMedia} = require("../utils/cloudinaryUploader");
const {winstonLogger} = require("../utils/logger/winstonLogger");
const {publishEvent} = require("../utils/rabbitmq");

const handleUserDeleted = async (info) => {
    winstonLogger.info({
        message: "User Deleted Handler for Post Service",
        info
    });
    const userId = info.userId;
    try {
        const posts = await Post.find(
            { authorId: userId },
            { _id: 1, mediaUrls: 1 }
        );

        for (const post of posts) {
            if (post.mediaUrls?.length) {
                await Promise.all([
                    publishEvent("post.deleted", {
                        postId: post._id.toString()
                    }),
                    ...post.mediaUrls.map(m => deleteMedia(m.public_id))
                ]);
            } else {
                await publishEvent("post.deleted", {
                    postId: post._id.toString()
                });
            }
        }

        await Post.deleteMany({ authorId: userId });
        await PostLike.deleteMany({ userId });

        winstonLogger.info({
            message: "Successfully deleted posts by user",
            userId
        });
    } catch (err) {
        winstonLogger.error({
            message: "Error deleting posts by user",
            userId,
            error: err
        });
    }
};


module.exports = {handleUserDeleted}