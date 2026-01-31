const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        content: {
            type: String,
            trim: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true,
        },
        depth: {
            type: Number,
            default: 0,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        repliesCount: {
            type: Number,
            default: 0,
        },
        mediaUrl: {
            secure_url : {type: "String"},
            public_id : {type: "String"},
            type: { type: String, enum: ["image", "video"], default: "image" }
        },
        isDeleted: {
            type: Boolean,
            default: false,
        }
    },
{ timestamps: true });


const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;