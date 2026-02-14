const {emitNotificationToUser} = require("../socket/socket");
const {winstonLogger} = require("../utils/logger/winstonLogger");

const messageReceivedHandler = async({userId, chatId, message}) => {
    winstonLogger.info("Message Received Handler", {userId, chatId, message});
    emitNotificationToUser(userId, {chatId, message});
}

module.exports = {messageReceivedHandler};