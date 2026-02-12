require("dotenv").config();
const mongodbconnect = require("./utils/mongodbconnect");
const {winstonLogger} = require("./utils/logger/winstonLogger");
const {connectToRabbitMQ, consumeEvent} = require("./utils/rabbitmq");
const {userFollowedHandler} = require("./event-handlers/userFollowedHandler");
const {commentToCommentHandler} = require("./event-handlers/commentToCommentHandler");
const {commentLikedHandler} = require("./event-handlers/commentLikedHandler")
const express = require("express");
const { createServer } = require("http");
const { initSocket } = require("./socket/socket");

const app = express();

const { morganMiddleware } = require("./middlewares/morganLogger");
const {postLikeHandler} = require("./event-handlers/postLikeHandler");
app.use(morganMiddleware);

mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("NotificationService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

async function startServer() {
    try {
        await connectToRabbitMQ();
        await consumeEvent("user.followed", userFollowedHandler);
        await consumeEvent("post.liked", postLikeHandler);
        await consumeEvent("comment.commented", commentToCommentHandler);
        await consumeEvent("comment.liked", commentLikedHandler);

        const port = process.env.NOTIFICATION_SERVICE_PORT || 3005;

        const httpServer = createServer(app);

        initSocket(httpServer);

        httpServer.listen(port, () =>
            winstonLogger.info("Notification Service listening on port " + port)
        );

    } catch (err) {
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}

startServer();