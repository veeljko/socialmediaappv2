const Comment = require("../models/comment-model");
const {deleteMedia} = require("../utils/cloudinaryUploader");
const {winstonLogger} = require("../utils/logger/winstonLogger");

const handleUserDeleted = async (userId) => {
    winstonLogger.info("User deleted handler");
    // try {
    //     const posts = await Post.find({authorId: userId});
    //     for (const post of posts){
    //         if (post.mediaUrls){
    //             for (const media of post.mediaUrls){
    //                 await deleteMedia(media.public_id)
    //             }
    //         }
    //         await Post.findByIdAndDelete(post._id);
    //     }
    //     winstonLogger.info("Successfully deleted posts by", userId);
    // }
    // catch (err) {
    //     winstonLogger.error("Error deleting posts by user", err);
    // }
}

module.exports = {handleUserDeleted}