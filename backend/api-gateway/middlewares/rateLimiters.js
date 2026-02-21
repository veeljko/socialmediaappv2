const {slidingWindowLimiter} = require("../config/slidingWindowLimiter")

const loginLimiter = slidingWindowLimiter({
    keyPrefix: "rate:login",
    points: 5,
    duration: process.env.RATE_LIMIT
});
const registerLimiter = slidingWindowLimiter({
    keyPrefix: "rate:register",
    points: 3,
    duration: process.env.RATE_LIMIT
});
const postLimiter = slidingWindowLimiter({
    keyPrefix: "rate:posts",
    points: 60,
    duration: process.env.RATE_LIMIT
});
const notificationLimiter = slidingWindowLimiter({
    keyPrefix: "rate:notifications",
    points: 200,
    duration: process.env.RATE_LIMIT
});

module.exports = {loginLimiter, registerLimiter, postLimiter, notificationLimiter}

