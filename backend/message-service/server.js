require("dotenv").config();
const express = require("express");
const mongodbconnect = require("./utils/mongodbconnect");
const {winstonLogger} = require("./utils/logger/winstonLogger")
const { createServer } = require("http");
const { initSocket } = require("./socket/socket");

const app = express();

mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("MessageService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

async function startServer() {
    try {
        const port = process.env.MESSAGE_SERVICE_PORT || 3006;

        const httpServer = createServer(app);

        initSocket(httpServer);

        httpServer.listen(port, () =>
            winstonLogger.info("Message Service listening on port " + port)
        );

    } catch (err) {
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}

startServer();
