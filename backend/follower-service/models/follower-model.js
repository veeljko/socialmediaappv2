const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });


followerSchema.index(
    { followerId: 1, followingId: 1 },
    { unique: true }
);

followerSchema.index({ followerId: 1, _id: 1 });

followerSchema.index({ followingId: 1, _id: 1 });


module.exports = mongoose.model("Follow", followerSchema);
