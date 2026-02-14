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
        const messageModel = {
            chatId,
            senderId: socket.userId,
            text
        }
        const message = await Message.create(messageModel);
        const chat = await Chat.findById(chatId).select("+participants")
        for (const user of chat.participants){
            messageModel.receiverId = user.toString();
            if (user.toString() !== socket.userId) await publishEvent("message.sent", messageModel);
        }
        
        winstonLogger.info("User sent a message to chat", {text, userId : socket.userId, chatId});
        io.to(chatId).emit("new_message", message);
    });
};

module.exports = {handleMessage}