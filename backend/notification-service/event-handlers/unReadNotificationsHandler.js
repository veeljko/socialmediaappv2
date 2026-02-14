const Notification = require("../models/notification-model")
const { emitNotificationToUser } = require("../socket/socketEmitter");
const {winstonLogger} = require("../utils/logger/winstonLogger");

const unReadNotificationsHandler = async (userId) => {
    const notifications = await Notification.find({
        recipientId: userId,
        isRead: false
    });

    if (!notifications.length) return;

    await Promise.all(
        notifications.map(notification =>
            emitNotificationToUser(userId, notification)
        )
    );

    await Notification.updateMany(
        {
            _id: { $in: notifications.map(n => n._id) }
        },
        {
            $set: { isRead: true }
        }
    );
};


module.exports = {unReadNotificationsHandler}