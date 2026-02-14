const {redisClient} = require("../config/redisClient");

async function addSocket(userId, socketId) {
    await redisClient.sadd(`onlineUsers:${userId}`, socketId);

    await redisClient.sadd("onlineUsers", userId);
}


async function removeSocket(userId, socketId) {
    await redisClient.srem(`onlineUsers:${userId}`, socketId);

    const remaining = await redisClient.scard(`onlineUsers:${userId}`);

    if (remaining === 0) {
        await redisClient.del(`onlineUsers:${userId}`);

        await redisClient.srem("onlineUsers", userId);
    }
}

async function getUserSockets(userId) {
    return await redisClient.smembers(`onlineUsers:${userId}`);
}

async function isUserOnline(userId) {
    const count = await redisClient.scard(`onlineUsers:${userId}`);
    return count > 0;
}

async function printOnlineSockets() {
    const users = await redisClient.smembers("onlineUsers");

    const table = await Promise.all(
        users.map(async (userId) => ({
            userId,
            sockets: await redisClient.smembers(`onlineUsers:${userId}`)
        }))
    );

    console.table(table);
}


module.exports = {addSocket, removeSocket, getUserSockets, isUserOnline, printOnlineSockets};

