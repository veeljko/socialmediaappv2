const mongoose = require("mongoose");

const adminChatSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    }
});

adminChatSchema.index({adminChat : 1});

module.exports = mongoose.model("AdminChat", adminChatSchema);

