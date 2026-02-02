require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const app = express();

const CommentLike = require("./models/comment-like-model");
const Comment = require("./models/comment-model");
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

app.get("/get-comments-from-post/:postId", async (req, res) => {
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
})

app.get("/get-comments-from-comment/:commentId", async (req, res) => {
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
})

app.put("/update-comment/:commentId", upload.array("media", 1), async (req, res) => {
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

})


mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("CommentService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

async function startServer(){
    try{
        await connectToRabbitMq();
        const port = process.env.COMMENT_SERVICE_PORT || 3002;
        app.listen(port, ()=>
            winstonLogger.info("Comment service listening on port " + port)
        );
    }
    catch(err){
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}
startServer();