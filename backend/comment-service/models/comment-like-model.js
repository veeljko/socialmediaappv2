const mongoose = require("mongoose");

const commentLikeSchema = new mongoose.Schema({
    commentId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    postId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

}, { timestamps: true , unique : true});

commentLikeSchema.index(
    { userId: 1, commentId: 1 },
    { unique: true }
);


const CommentLike = mongoose.model("CommentLike", commentLikeSchema);
module.exports = CommentLike;
