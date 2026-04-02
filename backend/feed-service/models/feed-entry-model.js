const mongoose = require("mongoose");

const feedEntrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        postAuthorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        createdAt: {
            type: Date,
            required: true,
            index: true,
        },
        source: {
            type: String,
            enum: ["push", "pull"],
            default: "push",
        },
    },
    {
        versionKey: false,
    }
);

feedEntrySchema.index({ userId: 1, createdAt: -1, postId: -1 });
feedEntrySchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("FeedEntry", feedEntrySchema);
