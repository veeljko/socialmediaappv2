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

const {
    addCommentToPost,
    likeComment,
    unlikeComment,
    addCommentToComment,
    getCommentsFromPost,
    getCommentsFromComment,
    updateComment,
} = require("./controllers/commentController");


app.post("/add-comment-to-post/:postId", upload.array("media", 1), addCommentToPost);
app.post("/like-comment/:commentId", likeComment);
app.post("/unlike-comment/:commentId", unlikeComment);
app.post("/add-comment-to-comment/:commentId", upload.array("media", 1), addCommentToComment);
app.get("/get-comments-from-post/:postId", getCommentsFromPost);
app.get("/get-comments-from-comment/:commentId", getCommentsFromComment);
app.put("/update-comment/:commentId", upload.array("media", 1), updateComment);


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