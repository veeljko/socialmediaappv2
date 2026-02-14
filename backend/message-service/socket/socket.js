const { winstonLogger } = require("../utils/logger/winstonLogger");
const { Server } = require("socket.io");
const { authSocketMiddleware } = require("./middleware/auth.socket")
const { handleMessage } = require("./handlers/message-handler");
const Chat = require("../models/chat-model")
const Message = require("../models/message-model")

let io;
/*
povezati ovo sa notification service preko rabbitmq
kada se izbrise korisnik, izbrisu se sve njegove notifikacije
*/
const initSocket = (httpServer) => {

    io = new Server(httpServer, { cors: { origin: "*" } });
    winstonLogger.info("Socket.io server initialized");
    io.use(authSocketMiddleware);

    io.on("connection", async (socket) => {
        winstonLogger.info("User connected:", {userId : socket.userId});

        handleMessage(io, socket);

        socket.on("sync_messages", async ({ lastMessageTimestamp }) => {
            winstonLogger.info("primeljan sync_message");

            const rooms = [...socket.rooms]
                .filter(r => r !== socket.id);

            const messages = await Message.find({
                createdAt: { $gt: lastMessageTimestamp },
                chatId: { $in: rooms }
            });

            socket.emit("missed_messages", messages);
        });

        const chats = await Chat.find({
            participants: socket.userId
        }).select("_id");

        chats.forEach(chat => {
            socket.join(chat._id.toString());
            winstonLogger.info("User joined a room", {userId : socket.userId, chatId : chat._id.toString()});
        });

        socket.on("disconnect", () => {
            winstonLogger.info("Disconnected:", {userId : socket.userId});
        });
    });
    
};

const getIO = () => io;

module.exports = { initSocket, getIO };