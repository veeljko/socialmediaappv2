require("dotenv").config();
const express = require("express");
const helmet = require("helmet");

const mongodbconnect = require("./utils/mongodbconnect");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { getFeed } = require("./controllers/feedController");
const {
    handlePostCreated,
    handlePostDeleted,
} = require("./event-handlers/post-event-handler");
const {
    handleUserFollow,
    handleUserUnFollow,
} = require("./event-handlers/follow-event-handler");
const { handleUserDeleted } = require("./event-handlers/user-event-handler");
const { winstonLogger } = require("./utils/logger/winstonLogger");
const { morganMiddleware } = require("./middlewares/morganLogger");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morganMiddleware);

app.get("/get-feed", getFeed);

mongodbconnect
    .connectToMongodb()
    .then(() => {
        winstonLogger.info("FeedService connected to MongoDB");
    })
    .catch((err) => winstonLogger.error("Error connecting to MongoDB", err));

async function startServer() {
    try {
        await connectToRabbitMQ();

        await consumeEvent("user.deleted", handleUserDeleted);
        await consumeEvent("user.followed", handleUserFollow);
        await consumeEvent("user.unfollowed", handleUserUnFollow);
        await consumeEvent("post.created", handlePostCreated);
        await consumeEvent("post.deleted", handlePostDeleted);

        const port = process.env.FEED_SERVICE_PORT || 3007;
        app.listen(port, () =>
            winstonLogger.info("Feed service listening on port " + port)
        );
    } catch (err) {
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}

startServer();
