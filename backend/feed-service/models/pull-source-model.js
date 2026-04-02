const mongoose = require("mongoose");

const pullSourceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    }
);

pullSourceSchema.index({ userId: 1, authorId: 1 }, { unique: true });

module.exports = mongoose.model("PullSource", pullSourceSchema);
