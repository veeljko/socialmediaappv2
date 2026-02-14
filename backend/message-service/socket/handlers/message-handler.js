const Message = require("../../models/message-model")
const {winstonLogger} = require("../../utils/logger/winstonLogger");

const handleMessage = (io, socket) => {
    socket.on("join_chat", (chatId) => {
        winstonLogger.info("User joined a chat room", {userId : socket.userId, chatId});
        socket.join(chatId);
    });

    socket.on("send_message", async (data) => {
        const { chatId, text } = data;

        const message = await Message.create({
                chatId,
                senderId: socket.userId,
                text
        });
        winstonLogger.info("User sent a message to chat", {text, userId : socket.userId, chatId});
        io.to(chatId).emit("new_message", message);
    });
};

module.exports = {handleMessage}