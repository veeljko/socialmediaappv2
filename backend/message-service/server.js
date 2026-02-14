require("dotenv").config();
const express = require("express");
const mongodbconnect = require("./utils/mongodbconnect");
const { connectToRabbitMQ } = require("./utils/rabbitmq")
const {winstonLogger} = require("./utils/logger/winstonLogger")
const { createServer } = require("http");
const { initSocket } = require("./socket/socket");
const {
    createChat,
    addUserToChat,
    removeUserFromChat,
    deleteChat,
    getMessages
} = require("./controllers/message-service-controller");
const app = express();
const multer = require("multer");
const upload = new multer();
const helmet = require("helmet");
const { morganMiddleware } = require("./middlewares/morganLogger");

mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("MessageService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

app.use(express.json());
app.use(helmet());
app.use(morganMiddleware);

app.post("/create-chat", upload.array("chatMembers"), createChat)
app.put("/add-user-to-chat/:chatId", upload.none(), addUserToChat);
app.put("/remove-user-from-chat/:chatId", upload.none(), removeUserFromChat)
app.delete("/delete-chat/:chatId", upload.none(), deleteChat);
app.get("/load-messages/:chatId", upload.none(), getMessages);


async function startServer() {
    try {
        await connectToRabbitMQ();
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
