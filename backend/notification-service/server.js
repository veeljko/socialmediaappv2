require("dotenv").config();
const mongodbconnect = require("./utils/mongodbconnect");
const {winstonLogger} = require("./utils/logger/winstonLogger");
const {connectToRabbitMQ, consumeEvent} = require("./utils/rabbitmq");
const express = require("express");

const app = express();

const { morganMiddleware } = require("./middlewares/morganLogger");
app.use(morganMiddleware);

mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("NotificationService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);



async function startServer(){
    try{
        await connectToRabbitMQ();


        const port = process.env.NOTIFICATION_SERVICE_PORT || 3005;
        app.listen(port, ()=>
            winstonLogger.info("Notification Service listening on port " + port)
        );
    }
    catch(err){
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}
startServer();