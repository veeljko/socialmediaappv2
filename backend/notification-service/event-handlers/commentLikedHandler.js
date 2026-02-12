const {emitNotificationToUser} = require("../socket/socket");
const Notification = require("../models/notification-model");
const {NOTIFICATION_TYPES} = require("../models/notification-types");
const {winstonLogger} = require("../utils/logger/winstonLogger");

const commentLikedHandler = async ({commentId, commentAuthorId, likerId}) => {
    if (!commentId || !commentAuthorId || !likerId) {
        winstonLogger.warn("Invalid comment.liked event", { commentId, commentAuthorId, likerId });
        return;
    }

    try{
        const notification = await Notification.create({
            recipientId: authorId,
            senderId: likerId,
            type: NOTIFICATION_TYPES.COMMENT_LIKE,
            commentId : commentId
        });

        winstonLogger.info("Notification created successfully.", {notification : notification});
        emitNotificationToUser(commentAuthorId, notification);
    }
    catch(err){
        winstonLogger.error("Error while like to comment handler", {
            error: err.message,
            authorId, commentAuthorId, likerId
        });
    }
}

module.exports = {commentLikedHandler}