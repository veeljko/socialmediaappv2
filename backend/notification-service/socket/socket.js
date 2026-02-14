const { winstonLogger } = require("../utils/logger/winstonLogger");
const { Server } = require("socket.io");
const {addSocket, removeSocket, isUserOnline, printOnlineSockets} = require("../utils/socketManager")
const { unReadNotificationsHandler } = require("../event-handlers/unReadNotificationsHandler");
const Notification = require("../models/notification-model")
const NOTIFICATION_TYPES = require("../models/notification-types")
const { setIO } = require("./socketEmitter");

let io;


const initSocket = (httpServer) => {

    io = new Server(httpServer, { cors: { origin: "*" } });
    setIO(io);
    winstonLogger.info("Socket.io server initialized");

    io.on("connection", (socket) => {
        winstonLogger.info("New socket connection", {
            socketId: socket.id
        });

        socket.on("register", async (userId) => {
            if (!userId) {
                winstonLogger.warn("Socket register attempted without userId", {
                    socketId: socket.id
                });
                return;
            }

            socket.join(userId);
            socket.data.userId = userId;
            await addSocket(userId, socket.id);
            await unReadNotificationsHandler(userId);
            winstonLogger.info("User joined personal room", {
                userId,
                socketId: socket.id
            });

        });

        socket.on("disconnect", async (reason) => {
            winstonLogger.info("Socket disconnected", {
                socketId: socket.id,
                userId: socket.data.userId || null,
                reason
            });
            await removeSocket(socket.data.userId, socket.id);
        });

        socket.on("error", (err) => {
            winstonLogger.error("Socket error", {
                socketId: socket.id,
                error: err.message
            });
        });
    });
};

const emitNotificationToUser = async (userId, notification) => {
    try {
        if (!io) {
            winstonLogger.error("emitNotificationToUser called before socket initialization");
            return;
        }

        if (!userId) {
            winstonLogger.warn("emitNotificationToUser called without userId");
            return;
        }
        winstonLogger.info("Emit Notification", notification);

        io.to(userId).emit("new_notification", notification);
        await printOnlineSockets();

    } catch (err) {
        winstonLogger.error("Error emitting realtime notification", {
            userId,
            error: err.message
        });
    }
};

module.exports = { initSocket };
