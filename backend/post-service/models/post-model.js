const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    authorId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    content : {
        type : String,
        default : "",
        trim: true
    },
    mediaUrls: [{
        secure_url : {type: "String", required: true},
        public_id : {type: "String", required: true},
        type: { type: String, enum: ["image", "video"], default: "image" },
    }],
    likesCount : {
        type : Number,
        default : 0
    },
    commentsCount : {
        type : Number,
        default : 0
    }

}, { timestamps: true });

postSchema.index({authorId : 1, _id : 1});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
