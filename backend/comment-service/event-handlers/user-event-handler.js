const Comment = require("../models/comment-model");
const CommentLike = require("../models/comment-like-model");
const {deleteMedia} = require("../utils/cloudinaryUploader");
const {winstonLogger} = require("../utils/logger/winstonLogger");

const handleUserDeleted = async (info) => {
    winstonLogger.info({
        message: "User Deleted Handler for Comment Service",
        info
    });
    const userId = info.userId;
    try {
        const comments = await Comment.find(
            { authorId: userId },
            { _id: 1, mediaUrls: 1 }
        );

        for (const comment of comments) {
            if (comment.mediaUrls?.length) {
                await Promise.all(
                    comment.mediaUrls.map(m => deleteMedia(m.public_id))
                );
            }
        }

        await Comment.deleteMany({ authorId: userId });
        await CommentLike.deleteMany({ userId });
        winstonLogger.info({
            message: "Successfully deleted comments and comment likes by user",
            userId
        });
    } catch (err) {
        winstonLogger.error({
            message: "Error deleting comments and comment likes by user",
            userId,
            error: err
        });
    }
};


module.exports = {handleUserDeleted}