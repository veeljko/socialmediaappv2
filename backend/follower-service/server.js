require("dotenv").config();
const mongodbconnect = require("./utils/mongodbconnect");
const {winstonLogger} = require("./utils/logger/winstonLogger");
const {connectToRabbitMQ, consumeEvent} = require("./utils/rabbitmq");
const express = require("express");
const {handleUserDeleted} = require("./event-handlers/user-event-handler");

const app = express();
const helmet = require("helmet");
app.use(helmet())
const { morganMiddleware } = require("./middlewares/morganLogger");
app.use(morganMiddleware);

const {
    followUser,
    unFollowUser,
    getFollowingsFromUser,
    getFollowersFromUser
} = require('./controllers/follower-controller');


mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("FollowerService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

app.post("/follow/:targetUserId", followUser);
app.post("/unfollow/:targetUserId", unFollowUser);
app.get("/getFollowers/:targetUserId", getFollowersFromUser);
app.get("/getFollowings/:targetUserId", getFollowingsFromUser);

async function startServer(){
    try{
        await connectToRabbitMQ();

        await consumeEvent("user.deleted", handleUserDeleted)

        const port = process.env.FOLLOWER_SERVICE_PORT || 3004;
        app.listen(port, ()=>
            winstonLogger.info("Follower Service listening on port " + port)
        );
    }
    catch(err){
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}
startServer();