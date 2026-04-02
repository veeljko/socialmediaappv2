const Follower = require("../models/follower-model");
const { publishEvent } = require("../utils/rabbitmq");
const { winstonLogger } = require("../utils/logger/winstonLogger");
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

const removeFollower = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { targetUserId } = req.params;

        if (userId === targetUserId) {
            return res.status(400).json({
                message: "User can't remove follower himself"
            });
        }

        const result = await Follower.findOneAndDelete({
            followingId: userId,
            followerId: targetUserId
        });

        if (!result) {
            return res.status(409).json({
                message: "User does not follow that user"
            });
        }
        await publishEvent("user.unfollowed", {
            followerId: targetUserId,
            followingId: userId
        })
        return res.status(200).json({
            message: "Successfully removed follower"
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

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        let limit = parseInt(req.query.limit, 10) || 5;
        limit = Math.min(Math.max(limit, 1), 50);

        const query = {
            followingId: userId
        };

        if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
            query._id = { $gt: cursor };
        }

        const followers = await Follower.find(query)
            .sort({ _id: 1 })
            .limit(limit);

        const nextCursor =
            followers.length > 0 ? followers.at(-1)._id : null;

        res.json({
            followers,
            cursor: nextCursor
        });

    } catch (err) {
        winstonLogger.error("Error while getting followers from user", {err});
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getFollowingsFromUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { cursor } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        let limit = parseInt(req.query.limit, 10) || 5;
        limit = Math.min(Math.max(limit, 1), 50);

        const query = {
            followerId: userId
        };

        if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
            query._id = { $gt: cursor };
        }

        const followings = await Follower.find(query)
            .sort({ _id: 1 })
            .limit(limit);

        const nextCursor =
            followings.length > 0 ? followings.at(-1)._id : null;

        res.json({
            followings,
            cursor: nextCursor
        });

    } catch (err) {
        winstonLogger.error("Error while getting followings from user", {err});
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getFollowerIdsBatch = async (req, res) => {
    try {
        const { userId } = req.params;
        const { cursor } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        let limit = parseInt(req.query.limit, 10) || 1000;
        limit = Math.min(Math.max(limit, 1), 2000);

        const query = {
            followingId: userId
        };

        if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
            query._id = { $gt: cursor };
        }

        const [followers, totalCount] = await Promise.all([
            Follower.find(query, { followerId: 1 })
                .sort({ _id: 1 })
                .limit(limit)
                .lean(),
            Follower.countDocuments({ followingId: userId })
        ]);

        const nextCursor =
            followers.length === limit ? followers.at(-1)._id : null;

        return res.status(200).json({
            followerIds: followers.map((follower) => String(follower.followerId)),
            cursor: nextCursor,
            totalCount,
        });
    } catch (err) {
        winstonLogger.error("Error while getting follower ids batch", { err });
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const isFollowing = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const { targetId } = req.params;
    try {
        const ans = await Follower.find({ followerId: userId, followingId: targetId });
        if (ans.length) return res.status(202).send({message : "User is follower", answer : true});
        return res.status(200).send({message : "User is not follower", answer : false});
    }
    catch(err){
        winstonLogger.error("Error while checking is user following other user", {err});
        return res.status(403);
    }
}


module.exports = { 
  followUser, 
  unFollowUser, 
  getFollowersFromUser, 
  getFollowingsFromUser, 
  getFollowerIdsBatch,
  isFollowing,
  removeFollower
};
