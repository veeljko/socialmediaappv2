const { redisClient } = require("./redisClient");

const slidingWindowLimiter = ({keyPrefix, points, duration,}) => {
    return async (req, res, next) => {
        try {
            const identifier = req.user?.userId || req.ip;

            const key = `${keyPrefix}:${identifier}`;
            const now = Date.now();
            const windowStart = now - duration * 1000;

            await redisClient.zremrangebyscore(key, 0, windowStart);
            const count = await redisClient.zcard(key);

        if (count >= points) {
            return res.status(429).json({
                message: "Too many requests",
            });
        }

        await redisClient.zadd(key, now, `${now}-${Math.random()}`);
        await redisClient.expire(key, duration);

        next();
        } catch (err) {
            console.error(err);
            next();
        }
    };
};

module.exports = {slidingWindowLimiter};
