const mongoose = require("mongoose");
const FeedEntry = require("../models/feed-entry-model");
const PullSource = require("../models/pull-source-model");
const { getPostsByAuthors, getPostsByIds } = require("../utils/serviceClients");
const { winstonLogger } = require("../utils/logger/winstonLogger");

function comparePosts(left, right) {
    const leftDate = new Date(left.createdAt).getTime();
    const rightDate = new Date(right.createdAt).getTime();

    if (leftDate !== rightDate) {
        return rightDate - leftDate;
    }

    return String(right._id).localeCompare(String(left._id));
}

const getFeed = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { cursorCreatedAt, cursorId } = req.query;

        let limit = Number.parseInt(req.query.limit, 10) || 20;
        limit = Math.min(Math.max(limit, 1), 50);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid userId",
            });
        }

        const query = { userId };

        if (cursorCreatedAt && cursorId) {
            const parsedCursorDate = new Date(cursorCreatedAt);

            if (Number.isNaN(parsedCursorDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid cursorCreatedAt",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(cursorId)) {
                return res.status(400).json({
                    message: "Invalid cursorId",
                });
            }

            query.$or = [
                { createdAt: { $lt: parsedCursorDate } },
                {
                    createdAt: parsedCursorDate,
                    postId: { $lt: new mongoose.Types.ObjectId(cursorId) },
                },
            ];
        }

        const fetchLimit = Math.min(limit * 2, 100);

        const [feedEntries, pullSources] = await Promise.all([
            FeedEntry.find(query)
                .sort({ createdAt: -1, postId: -1 })
                .limit(fetchLimit)
                .lean(),
            PullSource.find(
                { userId },
                { authorId: 1, _id: 0 }
            ).lean(),
        ]);

        const [pushPostsResponse, pullPostsResponse] = await Promise.all([
            getPostsByIds(feedEntries.map((entry) => String(entry.postId))),
            getPostsByAuthors({
                authorIds: pullSources.map((source) => String(source.authorId)),
                cursorCreatedAt,
                cursorId,
                limit: fetchLimit,
            }),
        ]);

        const pushPostsById = new Map(
            (pushPostsResponse.posts || []).map((post) => [String(post._id), post])
        );

        const missingFeedPostIds = feedEntries
            .filter((entry) => !pushPostsById.has(String(entry.postId)))
            .map((entry) => entry.postId);

        if (missingFeedPostIds.length) {
            FeedEntry.deleteMany({
                userId,
                postId: { $in: missingFeedPostIds },
            }).catch((error) =>
                winstonLogger.error({
                    message: "Unable to clean stale feed entries",
                    userId,
                    error,
                })
            );
        }

        const orderedPushPosts = feedEntries
            .map((entry) => pushPostsById.get(String(entry.postId)))
            .filter(Boolean);

        const mergedPostsMap = new Map();

        for (const post of [...orderedPushPosts, ...(pullPostsResponse.posts || [])]) {
            mergedPostsMap.set(String(post._id), post);
        }

        const posts = [...mergedPostsMap.values()]
            .sort(comparePosts)
            .slice(0, limit);

        const lastPost = posts.at(-1);

        return res.status(200).json({
            posts,
            cursor: lastPost
                ? {
                      createdAt: lastPost.createdAt,
                      id: lastPost._id,
                  }
                : null,
        });
    } catch (err) {
        winstonLogger.error({
            message: "Error while getting feed",
            error: err,
        });
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = { getFeed };
