const Notification = require("../models/notification-model");
const { winstonLogger } = require("../utils/logger/winstonLogger");
const NOTIFICATION_TYPES = require("../models/notification-types");
const {emitNotificationToUser} = require("../socket/socket");

const userFollowedHandler = async (event) => {
    try {
        if (!event.followingId || !event.followerId) {
            winstonLogger.warn("Invalid user.followed event", { event });
            return;
        }

        const notification = await Notification.create({
            recipientId: event.followingId,
            senderId: event.followerId,
            type: NOTIFICATION_TYPES.FOLLOW,
        });
        winstonLogger.info("Notification created successfully.", {notification : notification});
        emitNotificationToUser(event.followingId, notification);

    } catch (err) {
        winstonLogger.error("Error while follower handler", {
            error: err.message,
            event
        });
    }
}

module.exports = {userFollowedHandler};
