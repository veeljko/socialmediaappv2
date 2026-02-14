const { winstonLogger } = require("../../utils/logger/winstonLogger")

const authSocketMiddleware = async (socket, next) => {
    try {
        const userId = socket.handshake.auth.userId;

        if (!userId) {
            winstonLogger.error("Unauthorized socket user");
            return next(new Error("Unauthorized"));
        }

        socket.userId = userId;
        next();
    } catch (err) {
        winstonLogger.error("Auth socket failed");
        next(new Error("Auth failed"));
    }
};

module.exports = { authSocketMiddleware };