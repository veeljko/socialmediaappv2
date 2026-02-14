let io = null;

const setIO = (ioInstance) => {
    io = ioInstance;
};

const emitNotificationToUser = async (userId, notification) => {
    if (!io) return;

    io.to(userId).emit("new_notification", notification);
};

module.exports = {
    setIO,
    emitNotificationToUser,
};
