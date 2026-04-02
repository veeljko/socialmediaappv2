const mongoose = require("mongoose");

const celebrityAuthorSchema = new mongoose.Schema(
    {
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true,
        },
        activatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("CelebrityAuthor", celebrityAuthorSchema);
