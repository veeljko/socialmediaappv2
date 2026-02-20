const Redis = require("ioredis");

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // bitno za queue/rate-limit use cases
    enableReadyCheck: true,
    lazyConnect: false,
});

module.exports = {redisClient}