const { winstonLogger } = require("../utils/logger/winstonLogger");
const Follower = require("../models/follower-model");
const { publishEvent } = require("../utils/rabbitmq");

const handleUserDeleted = async ({ userId }) => {
    if (!userId) {
        winstonLogger.error({
            message: "Invalid user.deleted payload",
            userId
        });
        return;
    }

    try {
        const following = await Follower.find(
            { followerId: userId },
            { followerId: 1, followingId: 1 }
        );

        await Promise.all(
            following.map(rel =>
                publishEvent("follow.deleted", {
                    followerId: rel.followerId,
                    followingId: rel.followingId
                })
            )
        );

        const followers = await Follower.find(
            { followingId: userId },
            { followerId: 1, followingId: 1 }
        );

        await Promise.all(
            followers.map(rel =>
                publishEvent("follow.deleted", {
                    followerId: rel.followerId,
                    followingId: rel.followingId
                })
            )
        );

        await Follower.deleteMany({
            $or: [
                { followerId: userId },
                { followingId: userId }
            ]
        });

        winstonLogger.info({
            message: "Handled user.deleted in Follower service",
            userId,
            removedRelations: following.length + followers.length
        });

    } catch (err) {
        winstonLogger.error({
            message: "Unable to handle user.deleted in Follower service",
            userId,
            error: err
        });
    }
};

module.exports = { handleUserDeleted };
