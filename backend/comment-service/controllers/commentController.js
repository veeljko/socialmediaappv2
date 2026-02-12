require("dotenv").config();
const StatusCodes = require("http-status-codes");
const CommentLike = require("../models/comment-like-model");
const Comment = require("../models/comment-model");
const {connectToRabbitMq} = require("../utils/rabbitmq");
const {winstonLogger} = require("../utils/logger/winstonLogger");
const { uploadImage, deleteMedia } = require("../utils/cloudinaryUploader");
const {publishEvent} = require("../utils/rabbitmq");

const addCommentToPost = async (req, res) => {
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

        await publishEvent("post.commented", {
            commentAuthorId : userId,
            commentId : comment._id,
            authorId : userId,
        })

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
}
const likeComment = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        try {
            await CommentLike.create({
                userId,
                commentId,
                postId: comment.postId,
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({
                    message: "Comment already liked by user",
                });
            }
            throw err;
        }

        await Comment.findByIdAndUpdate(
            commentId,
            { $inc: { likesCount: 1 } }
        );

        winstonLogger.info({
            message: "Successfully liked comment",
            userId,
            commentId,
        });

        return res.status(200).json({
            message: "Comment liked successfully!",
        });
    } catch (err) {
        winstonLogger.error({
            message: "Error liking comment",
            error: err,
        });

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
const unlikeComment = async (req, res) => {
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
}
const addCommentToComment = async (req, res) => {
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
    let targetCommentAuthroId;
    try{
        const targetComment = await Comment.findByIdAndUpdate(
            commentId,
            { $inc: { commentsCount: 1 } }
        )
        targetCommentId = targetComment._id
        targetCommentDepth = targetComment.depth;
        targetCommentPostId = targetComment.postId;
        targetCommentAuthroId = targetComment.authorId;
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

    await publishEvent("comment.commented", {
        authorId : targetCommentAuthorId,
        commenterId : userId,
        commentId : newComment._id
    })
    return res.status(200).send({
        message: "Comment saved successfully!",
    })
}
const getCommentsFromPost = async (req, res) => {
    const postId = req.params.postId;
    const cursor = req.query.cursor;
    let limit = req.query.limit;
    if (limit) limit = parseInt(limit);
    else limit = 5;

    if (cursor){
        const ans = await Comment.find({
            postId,
            parentId : null,
            _id : {$gt : cursor}
        }).sort({ _id : 1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find comment with postId");
            return res.status(404).send({
                message: "Could not find comment with postId"
            })
        }

        const newCursor = Object.values(ans).at(-1);
        return res.status(200).send({
            comments: ans,
            cursor : newCursor
        })
    }
    else{

        const ans = await Comment.find({
            postId,
            parentId : null
        }).sort({_id : 1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find comment with postId");
            return res.status(404).send({
                message: "Could not find comment with postId"
            })
        }

        const cursor = Object.values(ans).at(-1);
        return res.status(200).send({
            comments : ans,
            cursor : cursor
        })
    }
}
const getCommentsFromComment = async (req, res) => {
    const commentId = req.params.commentId;
    const cursor = req.query.cursor;
    let limit = req.query.limit;
    if (limit) limit = parseInt(limit);
    else limit = 5;

    const targetComment = await Comment.findById(commentId);
    if (!targetComment){
        winstonLogger.error("Could not find comment with commentId");
        return res.status(403).send({
            message: "Could not find comment with commentId"
        });
    }
    const postId = targetComment.postId;
    if (cursor){
        const ans = await Comment.find({
            postId,
            parentId : commentId,
            _id : {$gt : cursor}
        }).sort({ _id : 1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find comment with postId");
            return res.status(404).send({
                message: "Could not find comment with postId"
            })
        }

        const newCursor = Object.values(ans).at(-1);
        return res.status(200).send({
            comments: ans,
            cursor : newCursor
        })
    }
    else{

        const ans = await Comment.find({
            postId,
            parentId : commentId
        }).sort({_id : 1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find comment with postId");
            return res.status(404).send({
                message: "Could not find comment with postId"
            })
        }

        const cursor = Object.values(ans).at(-1);
        return res.status(200).send({
            comments : ans,
            cursor : cursor
        })
    }
}
const updateComment = async (req, res)=> {
    const userId = req.headers['x-user-id'];
    const commentId = req.params.commentId;

    const targetComment = await Comment.findById(commentId);
    if (!targetComment){
        winstonLogger.error("Could not find comment with commentId");
        return res.status(404).send({
            message: "Could not find comment with commentId"
        })
    }
    if (targetComment.authorId.toString() !== userId){
        winstonLogger.error("User cant edit that comment");
        return res.status(403).send({
            message: "User cant edit that comment"
        })
    }

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
    if (!req.body.content && media.length === 0) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }
    targetComment.content = req.body.content;
    targetComment.mediaUrl = media;
    await targetComment.save();
    return res.status(200).send({
        message: "Comment updated successfully"
    })
};

module.exports = {
    addCommentToPost,
    likeComment,
    unlikeComment,
    addCommentToComment,
    getCommentsFromPost,
    getCommentsFromComment,
    updateComment,
}
