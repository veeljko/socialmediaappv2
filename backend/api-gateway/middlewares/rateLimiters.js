const {slidingWindowLimiter} = require("../config/slidingWindowLimiter")

const loginLimiter = slidingWindowLimiter({
    keyPrefix: "rate:login",
    points: 5,
    duration: 60,
});
const registerLimiter = slidingWindowLimiter({
    keyPrefix: "rate:register",
    points: 3,
    duration: 60,
});
const postLimiter = slidingWindowLimiter({
    keyPrefix: "rate:posts",
    points: 60,
    duration: 60,
});
const notificationLimiter = slidingWindowLimiter({
    keyPrefix: "rate:notifications",
    points: 200,
    duration: 60,
});

module.exports = {loginLimiter, registerLimiter, postLimiter, notificationLimiter}

