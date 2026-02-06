const User = require("../models/user_model");
const { winstonLogger } = require("../utils/logger/winstonLogger");

const handleUserFollow = async ({ followerId, followingId }) => {
    if (!followerId || !followingId) {
        winstonLogger.error({
            message: "Invalid follow.created payload",
            followerId,
            followingId
        });
        return;
    }

    await Promise.all([
        User.updateOne(
            { _id: followerId },
            { $inc: { followingCount: 1 } }
        ),
        User.updateOne(
            { _id: followingId },
            { $inc: { followersCount: 1 } }
        )
    ]);

    winstonLogger.info({
        message: "Follow counters updated",
        followerId,
        followingId
    });
};

const handleUserUnFollow = async ({ followerId, followingId }) => {
    if (!followerId || !followingId) {
        winstonLogger.error({
            message: "Invalid follow.deleted payload",
            followerId,
            followingId
        });
        return;
    }

    await Promise.all([
        User.updateOne(
            { _id: followerId, followingCount: { $gt: 0 } },
            { $inc: { followingCount: -1 } }
        ),
        User.updateOne(
            { _id: followingId, followersCount: { $gt: 0 } },
            { $inc: { followersCount: -1 } }
        )
    ]);

    winstonLogger.info({
        message: "Unfollow counters updated",
        followerId,
        followingId
    });
};

module.exports = { handleUserFollow, handleUserUnFollow };
