const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema({
    commentId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

}, { timestamps: true });

const CommentLike = mongoose.model("CommentLike", commentLikeSchema);
module.exports = CommentLike;
