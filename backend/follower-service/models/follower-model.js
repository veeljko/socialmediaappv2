const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
    {
        followerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        followingId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

followSchema.index(
    { followerId: 1, followingId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Follow", followSchema);
