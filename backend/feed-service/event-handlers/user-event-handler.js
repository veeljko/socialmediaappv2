const { winstonLogger } = require("../utils/logger/winstonLogger");
const FeedEntry = require("../models/feed-entry-model");
const PullSource = require("../models/pull-source-model");
const CelebrityAuthor = require("../models/celebrity-author-model");

const handleUserDeleted = async ({ userId }) => {
    if (!userId) {
        winstonLogger.error({
            message: "Invalid user.deleted payload",
            userId,
        });
        return;
    }

    try {
        await Promise.all([
            FeedEntry.deleteMany({
                $or: [
                    { userId },
                    { postAuthorId: userId },
                ],
            }),
            PullSource.deleteMany({
                $or: [
                    { userId },
                    { authorId: userId },
                ],
            }),
            CelebrityAuthor.deleteOne({ authorId: userId }),
        ]);

        winstonLogger.info({
            message: "Handled user.deleted in Feed service",
            userId,
        });
    } catch (err) {
        winstonLogger.error({
            message: "Unable to handle user.deleted in Feed service",
            userId,
            error: err,
        });
    }
};

module.exports = { handleUserDeleted };
