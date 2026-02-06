const {winstonLogger} = require("../utils/logger/winstonLogger");
const {deleteMedia} = require("../utils/cloudinaryUploader");
const CommentLike = require("../models/comment-like-model");
const Comment = require("../models/comment-model");

const handlePostDeleted = async (info) => {
    winstonLogger.info({
        message: "Post Deleted Handler for Comment Service",
        info
    });
    const postId = info.postId;
    try {
        const comments = await Comment.find(
            { postId },
            { _id: 1, mediaUrls: 1 }
        );

        for (const comment of comments) {
            if (comment.mediaUrl?.length) {
                await Promise.all(
                    comment.mediaUrl.map(m => deleteMedia(m.public_id))
                );
            }
        }

        await CommentLike.deleteMany({ postId });
        await Comment.deleteMany({ postId });

        winstonLogger.info({
            message: "Successfully deleted comments and comment likes from post",
            postId
        });
    } catch (err) {
        winstonLogger.error({
            message: "Error deleting comments and comment likes from post",
            postId,
            error: err
        });
    }
};


module.exports = {handlePostDeleted}