const FeedEntry = require("../models/feed-entry-model");
const PullSource = require("../models/pull-source-model");
const CelebrityAuthor = require("../models/celebrity-author-model");
const { getLatestPostsByAuthor } = require("../utils/serviceClients");
const { winstonLogger } = require("../utils/logger/winstonLogger");

const FOLLOW_BACKFILL_LIMIT =
    Number.parseInt(process.env.FOLLOW_BACKFILL_LIMIT, 10) || 20;
const WRITE_CHUNK_SIZE =
    Number.parseInt(process.env.FEED_WRITE_CHUNK_SIZE, 10) || 500;

function chunkItems(items, size) {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
}

async function upsertFeedEntriesForPosts(userId, posts) {
    const chunks = chunkItems(posts, WRITE_CHUNK_SIZE);

    for (const chunk of chunks) {
        await FeedEntry.bulkWrite(
            chunk.map((post) => ({
                updateOne: {
                    filter: {
                        userId,
                        postId: post._id,
                    },
                    update: {
                        $setOnInsert: {
                            userId,
                            postId: post._id,
                            postAuthorId: post.authorId,
                            createdAt: post.createdAt,
                            source: "push",
                        },
                    },
                    upsert: true,
                },
            })),
            { ordered: false }
        );
    }
}

const handleUserFollow = async ({ followerId, followingId }) => {
    if (!followerId || !followingId) {
        winstonLogger.error({
            message: "Invalid user.followed payload",
            followerId,
            followingId,
        });
        return;
    }

    try {
        const isCelebrity = await CelebrityAuthor.exists({ authorId: followingId });

        if (isCelebrity) {
            await PullSource.updateOne(
                { userId: followerId, authorId: followingId },
                {
                    $setOnInsert: {
                        userId: followerId,
                        authorId: followingId,
                        createdAt: new Date(),
                    },
                },
                { upsert: true }
            );

            winstonLogger.info({
                message: "Added celebrity pull source on follow",
                followerId,
                followingId,
            });
            return;
        }

        const response = await getLatestPostsByAuthor(
            followingId,
            FOLLOW_BACKFILL_LIMIT
        );

        const posts = response.posts || [];

        if (posts.length) {
            await upsertFeedEntriesForPosts(followerId, posts);
        }

        winstonLogger.info({
            message: "Backfilled feed on follow",
            followerId,
            followingId,
            postsCount: posts.length,
        });
    } catch (err) {
        winstonLogger.error({
            message: "Unable to handle user.followed in Feed service",
            followerId,
            followingId,
            error: err,
        });
    }
};

const handleUserUnFollow = async ({ followerId, followingId }) => {
    if (!followerId || !followingId) {
        winstonLogger.error({
            message: "Invalid user.unfollowed payload",
            followerId,
            followingId,
        });
        return;
    }

    try {
        await Promise.all([
            FeedEntry.deleteMany({
                userId: followerId,
                postAuthorId: followingId,
            }),
            PullSource.deleteOne({
                userId: followerId,
                authorId: followingId,
            }),
        ]);

        winstonLogger.info({
            message: "Removed feed data on unfollow",
            followerId,
            followingId,
        });
    } catch (err) {
        winstonLogger.error({
            message: "Unable to handle user.unfollowed in Feed service",
            followerId,
            followingId,
            error: err,
        });
    }
};

module.exports = { handleUserFollow, handleUserUnFollow };
