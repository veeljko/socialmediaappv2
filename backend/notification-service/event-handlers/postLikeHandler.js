const {emitNotificationToUser} = require("../socket/socket");
const Notification = require("../models/notification-model");
const {NOTIFICATION_TYPES} = require("../models/notification-types");
const {winstonLogger} = require("../utils/logger/winstonLogger");

const postLikeHandler = async (event) => {
    const postId = event.postId;
    const likerId = event.userId;
    const postOwnerId = event.authorId;

    if (!postId || !likerId || !postOwnerId) {
        winstonLogger.warn("Invalid post.liked event", { event });
        return;
    }

    try{
        const notification = await Notification.create({
            recipientId: postOwnedId,
            senderId: likerId,
            type: NOTIFICATION_TYPES.POST_LIKE,
        });

        winstonLogger.info("Notification created successfully.", {notification : notification});
        emitNotificationToUser(postOwnerId, notification);
    }
    catch(err){
        winstonLogger.error("Error while follower handler", {
            error: err.message,
            event
        });
    }
}

module.exports = {postLikeHandler};