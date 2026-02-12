const mongoose = require("mongoose");

const postLikeSchema = new mongoose.Schema({
    postId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

}, { timestamps: true });

postLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

const PostLike = mongoose.model("PostLike", postLikeSchema);
module.exports = PostLike;
