const Message = require("../../models/message-model")
const Chat = require("../../models/chat-model")
const {winstonLogger} = require("../../utils/logger/winstonLogger");
const { publishEvent } = require("../../utils/rabbitmq");

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
        const chat = await Chat.findById(chatId).select("+participants")
        for (const user of chat.participants){
            if (user.toString() !== socket.userId) await publishEvent("message.sent", {userId : user.toString(), chatId, message});
        }
        
        winstonLogger.info("User sent a message to chat", {text, userId : socket.userId, chatId});
        io.to(chatId).emit("new_message", message);
    });
};

module.exports = {handleMessage}