const { winstonLogger } = require("../utils/logger/winstonLogger");
const { Server } = require("socket.io");

let io;

const initSocket = (httpServer) => {

    io = new Server(httpServer, { cors: { origin: "*" } });
    winstonLogger.info("Socket.io server initialized");

    io.on("connection", (socket) => {
        winstonLogger.info("New socket connection", {
            socketId: socket.id
        });

        socket.on("register", (userId) => {
            if (!userId) {
                winstonLogger.warn("Socket register attempted without userId", {
                    socketId: socket.id
                });
                return;
            }

            socket.join(userId);
            socket.data.userId = userId;

            winstonLogger.info("User joined personal room", {
                userId,
                socketId: socket.id
            });

        });

        socket.on("disconnect", (reason) => {
            winstonLogger.info("Socket disconnected", {
                socketId: socket.id,
                userId: socket.data.userId || null,
                reason
            });
        });

        socket.on("error", (err) => {
            winstonLogger.error("Socket error", {
                socketId: socket.id,
                error: err.message
            });
        });
    });
};

const emitNotificationToUser = (userId, notification) => {
    try {
        if (!io) {
            winstonLogger.error("emitNotificationToUser called before socket initialization");
            return;
        }

        if (!userId) {
            winstonLogger.warn("emitNotificationToUser called without userId");
            return;
        }

        io.to(userId).emit("new_notification", notification);

        winstonLogger.info("Realtime notification emitted", {
            userId,
            notificationId: notification?._id || null
        });

    } catch (err) {
        winstonLogger.error("Error emitting realtime notification", {
            userId,
            error: err.message
        });
    }
};

module.exports = { initSocket, emitNotificationToUser };
