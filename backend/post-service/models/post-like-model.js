const mongoose = require("mongoose");

const postLikeScehma = new mongoose.Schema({
    postId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

}, { timestamps: true });

const PostLike = mongoose.model("PostLike", postLikeScehma);
module.exports = PostLike;
