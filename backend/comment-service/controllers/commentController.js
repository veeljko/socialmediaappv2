require("dotenv").config();
const StatusCodes = require("http-status-codes");
const CommentLike = require("../models/comment-like-model");
const Comment = require("../models/comment-model");
const { connectToRabbitMq } = require("../utils/rabbitmq");
const { winstonLogger } = require("../utils/logger/winstonLogger");
const { uploadImage, deleteMedia } = require("../utils/cloudinaryUploader");
const { publishEvent } = require("../utils/rabbitmq");

const LEADING_MENTION_REGEX = /^@([a-zA-Z0-9_]+)\s+/;

const addCommentToPost = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const postId = req.params.postId;
  let media = {};
  if (req.files[0]) {
    try {
      const ans = await uploadImage(req.files[0].buffer);
      media = {
        secure_url: ans.secure_url,
        public_id: ans.public_id,
        type: "image"
      }
    }
    catch (err) {
      winstonLogger.error("Error while uploading image", err);
      return res.status(400).send({
        message: "Error while adding comment to post",
      })
    }
  }
  try {
    const comment = await Comment.create({
      authorId: userId,
      postId: postId,
      content: req.body.content,
      mediaUrl: media,
      rootId: null,
    })

    await publishEvent("post.commented", {
      commentAuthorId: userId,
      commentId: comment._id,
      authorId: userId,
      postId: postId
    })


    return res.status(200).send({
      message: "Comment saved successfully!",
    })
  }
  catch (err) {
    winstonLogger.error("Error while adding comment", err);
    return res.status(400).send({
      message: "Error while adding comment",
    })
  }
}
const likeComment = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }
    if (comment.isDeleted) {
      return res.status(400).json({
        message: "Deleted comment cannot be liked",
      });
    }

    try {
      await CommentLike.create({
        userId,
        commentId,
        postId: comment.postId,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          message: "Comment already liked by user",
        });
      }
      throw err;
    }

    await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: 1 } }
    );

    winstonLogger.info({
      message: "Successfully liked comment",
      userId,
      commentId,
    });
    await publishEvent("comment.liked", {
      commentId,
      commentAuthorId: comment.authorId,
      likerId: userId
    })
    return res.status(200).json({
      message: "Comment liked successfully!",
    });
  } catch (err) {
    winstonLogger.error({
      message: "Error liking comment",
      error: err,
    });

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const unlikeComment = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const commentId = req.params.commentId;

  const commentLike = await CommentLike.findOne({
    commentId: commentId,
    userId: userId,
  });

  const targetComment = await Comment.findById(commentId);
  if (!targetComment) {
    return res.status(404).send({
      message: "Comment not found",
    })
  }
  if (targetComment.isDeleted) {
    return res.status(400).send({
      message: "Deleted comment cannot be unliked",
    })
  }

  if (commentLike) {
    await commentLike.deleteOne();
    winstonLogger.info("Successfully unlike the comment");

    await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: -1 } }
    )

    return res.status(200).send({
      message: `Comment is unliked by user successfully!`,
    })
  }
  return res.status(404).send({
    message: "Comment is not liked by user",
  })
}
const addCommentToComment = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const commentId = req.params.commentId;
  let media = {};
  if (req.files[0]) {
    try {
      const ans = await uploadImage(req.files[0].buffer);
      media = {
        secure_url: ans.secure_url,
        public_id: ans.public_id,
        type: "image"
      }
    }
    catch (err) {
      winstonLogger.error("Error while uploading image", err);
      return res.status(400).send({
        message: "Error while adding comment to post",
      })
    }
  }
  let targetCommentId;
  let targetCommentDepth;
  let targetCommentPostId;
  let targetCommentAuthorId;
  let targetCommentRootId;
  try {
    const targetComment = await Comment.findById(commentId);
    if (!targetComment) {
      return res.status(404).send({
        message: "Could not find comment with commentId",
      });
    }
    targetCommentId = targetComment._id
    targetCommentDepth = targetComment.depth;
    targetCommentPostId = targetComment.postId;
    targetCommentAuthorId = targetComment.authorId;
    targetCommentRootId = targetComment.rootId;
  }
  catch (err) {
    winstonLogger.error("Error while increasing replies count", err);
    return res.status(400).send({
      message: "Error while adding comment to post",
    })
  }
  const newComment = await Comment.create({
    postId: targetCommentPostId,
    authorId: userId,
    content: req.body.content,
    mediaUrl: media,
    parentId: targetCommentId,
    depth: targetCommentDepth + 1,
    rootId: targetCommentRootId ? targetCommentRootId : targetCommentId,
  });

  await Comment.findByIdAndUpdate(newComment.rootId, { $inc: { repliesCount: 1 } });

  await publishEvent("comment.commented", {
    authorId: targetCommentAuthorId,
    commenterId: userId,
    commentId: newComment._id,
    postId: targetCommentPostId
  })
  return res.status(200).send({
    message: "Comment saved successfully!",
    comment: newComment,
  })
}
const getCommentsFromPost = async (req, res) => {
  const postId = req.params.postId;
  const cursor = req.query.cursor;
  let limit = req.query.limit;
  if (limit) limit = parseInt(limit);
  else limit = 5;

  if (cursor) {
    const ans = await Comment.find({
      postId,
      parentId: null,
      _id: { $gt: cursor }
    }).sort({ _id: 1 }).limit(limit).exec()

    if (!ans) {
      winstonLogger.error("Could not find comment with postId");
      return res.status(404).send({
        message: "Could not find comment with postId"
      })
    }

    const newCursor = Object.values(ans).at(-1);
    return res.status(200).send({
      comments: ans,
      cursor: newCursor
    })
  }
  else {

    const ans = await Comment.find({
      postId,
      parentId: null
    }).sort({ _id: 1 }).limit(limit).exec()

    if (!ans) {
      winstonLogger.error("Could not find comment with postId");
      return res.status(404).send({
        message: "Could not find comment with postId"
      })
    }

    const cursor = Object.values(ans).at(-1);
    return res.status(200).send({
      comments: ans,
      cursor: cursor
    })
  }
}
const getCommentsFromComment = async (req, res) => {
  const commentId = req.params.commentId;
  const cursor = req.query.cursor;
  let limit = req.query.limit;
  if (limit) limit = parseInt(limit);
  else limit = 5;

  const targetComment = await Comment.findById(commentId);
  if (!targetComment) {
    winstonLogger.error("Could not find comment with commentId");
    return res.status(403).send({
      message: "Could not find comment with commentId"
    });
  }
  const postId = targetComment.postId;
  if (cursor) {
    const ans = await Comment.find({
      postId,
      rootId: commentId,
      _id: { $gt: cursor }
    }).sort({ _id: 1 }).limit(limit).exec()

    if (!ans) {
      winstonLogger.error("Could not find comment with postId");
      return res.status(404).send({
        message: "Could not find comment with postId"
      })
    }

    const newCursor = Object.values(ans).at(-1);
    return res.status(200).send({
      comments: ans,
      cursor: newCursor
    })
  }
  else {

    const ans = await Comment.find({
      postId,
      rootId: commentId
    }).sort({ _id: 1 }).limit(limit).exec()

    if (!ans) {
      winstonLogger.error("Could not find comment with postId");
      return res.status(404).send({
        message: "Could not find comment with postId"
      })
    }

    const cursor = Object.values(ans).at(-1);
    return res.status(200).send({
      comments: ans,
      cursor: cursor
    })
  }
}
const updateComment = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const commentId = req.params.commentId;

  const targetComment = await Comment.findById(commentId);
  if (!targetComment) {
    winstonLogger.error("Could not find comment with commentId");
    return res.status(404).send({
      message: "Could not find comment with commentId"
    })
  }
  if (targetComment.authorId.toString() !== userId) {
    winstonLogger.error("User cant edit that comment");
    return res.status(403).send({
      message: "User cant edit that comment"
    })
  }
  if (targetComment.isDeleted) {
    return res.status(400).send({
      message: "Deleted comment cannot be updated"
    })
  }

  let media = {};
  if (req.files?.[0]) {
    try {
      const ans = await uploadImage(req.files[0].buffer);
      media = {
        secure_url: ans.secure_url,
        public_id: ans.public_id,
        type: "image"
      }
    }
    catch (err) {
      winstonLogger.error("Error while uploading image", err);
      return res.status(400).send({
        message: "Error while adding comment to post",
      })
    }
  }
  const incomingContent = typeof req.body.content === "string"
    ? req.body.content
    : targetComment.content;
  const lockedMentionPrefix = targetComment.content?.match(LEADING_MENTION_REGEX)?.[0] || "";
  const sanitizedIncomingContent = lockedMentionPrefix
    ? incomingContent.replace(LEADING_MENTION_REGEX, "")
    : incomingContent;
  const nextContent = lockedMentionPrefix
    ? `${lockedMentionPrefix}${sanitizedIncomingContent.trimStart()}`
    : incomingContent;
  const hasNewMedia = !!media.public_id;
  const hasExistingMedia = !!targetComment.mediaUrl?.public_id;
  const contentBody = lockedMentionPrefix
    ? nextContent.slice(lockedMentionPrefix.length)
    : nextContent;

  if (!contentBody?.trim() && !hasNewMedia && !hasExistingMedia) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  if (hasNewMedia) {
    if (targetComment.mediaUrl?.public_id) {
      await deleteMedia(targetComment.mediaUrl.public_id);
    }
    targetComment.mediaUrl = media;
  }

  targetComment.content = nextContent;
  targetComment.isEdited = true;
  await targetComment.save();
  return res.status(200).send({
    message: "Comment updated successfully",
    comment: targetComment,
  })
};

const deleteComment = async (req, res) => {
  const userId = req.headers['x-user-id'];
  const commentId = req.params.commentId;
  const targetComment = await Comment.findById(commentId);
  if (!targetComment) {
    winstonLogger.error("Could not find comment with commentId");
    return res.status(404).send({
      message: "Could not find comment with commentId"
    })
  }
  if (targetComment.authorId.toString() !== userId) {
    winstonLogger.error("User cant delete that comment");
    return res.status(403).send({
      message: "User cant delete that comment"
    })
  }
  if (targetComment.isDeleted) {
    return res.status(200).send({
      message: "Comment already deleted",
      comment: targetComment,
    })
  }

  await CommentLike.deleteMany({ commentId: commentId });

  if (targetComment.mediaUrl?.public_id) {
    await deleteMedia(targetComment.mediaUrl.public_id);
  }

  targetComment.isDeleted = true;
  targetComment.content = "";
  targetComment.likesCount = 0;
  targetComment.mediaUrl = null;
  await targetComment.save();

  winstonLogger.info("Successfully deleted the comment");
  return res.status(200).send({
    message: "Comment deleted successfully",
    comment: targetComment,
  })
}

const isCommentLikedByUser = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.params.userId;
  const target = await CommentLike.find({ userId, commentId });
  // winstonLogger.info("IsCommentLikedByUser", {target});
  if (target.length) return res.status(200).send({ message: "User has liked specified comment", answer: true });
  return res.status(200).send({ message: "User has not liked specified comment", answer: false });
}

const getCommentById = async (req, res) => {
  const commentId = req.params.commentId;
  const targetComment = await Comment.findById(commentId);
  if (!targetComment) {
    winstonLogger.error("Could not find comment with commentId");
    return res.status(404).send({
      message: "Could not find comment with commentId"
    })
  }
  return res.status(200).send({
    comment: targetComment
  })
}

module.exports = {
  addCommentToPost,
  likeComment,
  unlikeComment,
  addCommentToComment,
  getCommentsFromPost,
  getCommentsFromComment,
  updateComment,
  deleteComment,
  isCommentLikedByUser,
  getCommentById
}
