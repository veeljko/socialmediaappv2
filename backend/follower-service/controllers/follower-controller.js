const Follower = require("../models/follower-model");
const {publishEvent} = require("../utils/rabbitmq");

const followUser = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { targetUserId } = req.params;

        if (userId === targetUserId) {
            return res.status(400).json({
                message: "User can't follow himself"
            });
        }

        try {
            await Follower.create({
                followerId: userId,
                followingId: targetUserId
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({
                    message: "User is already following that user"
                });
            }
            throw err;
        }

        await publishEvent("user.followed", {
            followerId: userId,
            followingId: targetUserId
        })
        return res.status(200).json({
            message: "Successfully followed user"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const unFollowUser = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { targetUserId } = req.params;

        if (userId === targetUserId) {
            return res.status(400).json({
                message: "User can't unfollow himself"
            });
        }

        const result = await Follower.findOneAndDelete({
            followerId: userId,
            followingId: targetUserId
        });

        if (!result) {
            return res.status(409).json({
                message: "User does not follow that user"
            });
        }
        await publishEvent("user.unfollowed", {
            followerId: userId,
            followingId: targetUserId
        })
        return res.status(200).json({
            message: "Successfully unfollowed user"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = { followUser, unFollowUser };