const Follower = require("../models/follower-model");
const {publishEvent} = require("../utils/rabbitmq");
const {winstonLogger} = require("../utils/logger/winstonLogger");
const mongoose = require("mongoose");

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


const getFollowersFromUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { cursor } = req.query;

        let limit = parseInt(req.query.limit, 10) || 5;
        limit = Math.min(Math.max(limit, 1), 50);

        const query = {
            followingId: userId
        };

        if (cursor) {
            query._id = {
                $gt: new mongoose.Types.ObjectId(cursor)
            };
        }

        const followers = await Follower.find(query)
            .populate("followerId", "username")
            .sort({ _id: 1 })
            .limit(limit)
            .exec();

        const nextCursor = followers.length
            ? followers.at(-1)._id
            : null;

        return res.status(200).json({
            followers,
            cursor: nextCursor
        });

    } catch (err) {
        winstonLogger.error({
            message: "Error fetching followers",
            error: err
        });

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getFollowingsFromUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { cursor } = req.query;

        let limit = parseInt(req.query.limit, 10) || 5;
        limit = Math.min(Math.max(limit, 1), 50);

        const query = {
            followerId: userId
        };

        if (cursor) {
            query._id = {
                $gt: new mongoose.Types.ObjectId(cursor)
            };
        }

        const followings = await Follower.find(query)
            .populate("followingId", "username")
            .sort({ _id: 1 })
            .limit(limit)
            .exec();

        const nextCursor = followings.length
            ? followings.at(-1)._id
            : null;

        return res.status(200).json({
            followings,
            cursor: nextCursor
        });

    } catch (err) {
        winstonLogger.error({
            message: "Error fetching followings",
            error: err
        });

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = { followUser, unFollowUser, getFollowersFromUser, getFollowingsFromUser };