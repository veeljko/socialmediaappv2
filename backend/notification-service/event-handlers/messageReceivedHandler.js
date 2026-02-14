const { emitNotificationToUser } = require("../socket/socketEmitter");
const {winstonLogger} = require("../utils/logger/winstonLogger");
const Notification = require("../models/notification-model")
const NOTIFICATION_TYPES = require("../models/notification-types")
const {isUserOnline} = require("../utils/socketManager")

const messageReceivedHandler = async(messageModel) => {
    winstonLogger.info("Message Received Handler", messageModel);
    const isRead = await isUserOnline(messageModel.receiverId);
    const notificationModel = {
        recipientId : messageModel.receiverId,
        senderId : messageModel.senderId,
        type : NOTIFICATION_TYPES.MESSAGE,
        isRead
    }
    const newNotification = await Notification.create(notificationModel)
    winstonLogger.info("Realtime notification emitted", {
        newNotification
    });

    await emitNotificationToUser(messageModel.receiverId, newNotification);
}

module.exports = {messageReceivedHandler};