require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const app = express();


const mongodbconnect = require("./utils/mongodbconnect");
const {connectToRabbitMq} = require("./utils/rabbitmq");

const multer = require("multer");
const upload = new multer();

const {winstonLogger} = require("./utils/logger/winstonLogger");
const helmet = require("helmet");
const { morganMiddleware } = require("./middlewares/morganLogger");


const {
    createPost,
    deletePost,
    likePost,
    unlikePost,
    deleteAllPostsByUser,
    deleteAllLikesByUser,
    getPostsByUser,
    getPosts,
    updatePost
} = require("./controllers/post-controller");

app.use(helmet());
app.use(morganMiddleware);

app.post("/create-post", upload.array("media"), createPost);
app.delete("/delete-post/:postId", deletePost);
app.post("/like-post/:postId", likePost);
app.delete("/unlike-post/:postId", unlikePost);
app.delete("/delete-all-posts-by-user/:userId", deleteAllPostsByUser);
app.delete("/delete-all-likes-by-user/:userId", deleteAllLikesByUser);
app.get("/get-posts-by-user/:userId", getPostsByUser);
app.get("/get-posts/", getPosts);
app.put("/update-post/:postId", upload.array("media"), updatePost);


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