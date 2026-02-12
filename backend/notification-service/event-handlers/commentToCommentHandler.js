const {emitNotificationToUser} = require("../socket/socket");
const Notification = require("../models/notification-model");
const {NOTIFICATION_TYPES} = require("../models/notification-types");
const {winstonLogger} = require("../utils/logger/winstonLogger");

const commentToCommentHandler = async ({authorId, commenterId, commentId}) => {
    if (!authorId || !commenterId || !commentId) {
        winstonLogger.warn("Invalid comment.commented event", { authorId, commenterId, commentId });
        return;
    }

    try{
        const notification = await Notification.create({
            recipientId: authorId,
            senderId: commentedId,
            type: NOTIFICATION_TYPES.COMMENT_REPLY,
            commentId : commentId
        });

        winstonLogger.info("Notification created successfully.", {notification : notification});
        emitNotificationToUser(authorId, notification);
    }
    catch(err){
        winstonLogger.error("Error while comment to comment handler", {
            error: err.message,
            {authorId, commenterId, commentId}
        });
    }
}

module.exports = {commentToCommentHandler}