const Chat = require("../models/chat-model");
const AdminChat = require("../models/admin-chat-model")
const Message = require("../models/message-model")
const {winstonLogger} = require("../utils/logger/winstonLogger");
const mongoose = require("mongoose");

const createChat = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const chatMembers = req.body.chatMembers;
        const participants = [...new Set([...chatMembers, userId])];
        winstonLogger.info({participants});

        if (participants.length < 2) {
            return res.status(400).json({
                message: "Chat must contain at least two participants"
            });
        }

        const existingChat = await Chat.findOne({
            participants: { $all: participants },
            $expr: { $eq: [{ $size: "$participants" }, participants.length] }
        });

        if (existingChat) {
            winstonLogger.warn("Chat already exists");

            return res.status(200).json({
                message: "Error while creating chat"
            });
        }

        const newChat = await Chat.create({
            participants
        });

        const newAdminChat = await AdminChat.create({
            adminId : userId,
            chatId : newChat._id
        })

        return res.status(201).json({
            message: "Chat created successfully",
            chat: newChat
        });

    } catch (err) {
        winstonLogger.error("Create chat error", { error: err.message });
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
const addUserToChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { chatMember } = req.body;

        if (!chatId || !chatMember){
            return res.status(400).json({
                message: "Invalid chatId or userId"
            });
        }

        const chatObjectId = new mongoose.Types.ObjectId(chatId);
        const memberObjectId = new mongoose.Types.ObjectId(chatMember);

        const chatExists = await Chat.exists({
            _id: chatObjectId,
        });

        if (!chatExists) {
            return res.status(403).json({
                message: "Chat doesn't exist"
            });
        }

        const result = await Chat.updateOne(
        {
            _id: chatObjectId,
            participants: { $ne: memberObjectId }
        },
        {
            $addToSet: { participants: memberObjectId }
        });


        if (result.matchedCount === 0) {
            return res.status(200).json({
                message: "User already in chat"
            });
        }

        return res.status(200).json({
            message: "Member added successfully"
        });

    } catch (err) {
        winstonLogger.error("Add member error", { error: err.message });

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
const removeUserFromChat = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { chatId } = req.params;
        const { chatMember } = req.body;
        if (!chatId || !chatMember) {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        const chatObjectId = new mongoose.Types.ObjectId(chatId);
        const memberObjectId = new mongoose.Types.ObjectId(chatMember);

        const chatExists = await Chat.exists({
            _id: chatObjectId,
        });

        if (!chatExists) {
            return res.status(403).json({
                message: "You are not a participant of this chat"
            });
        }

        const result = await Chat.updateOne(
        {
            _id: chatObjectId,
            participants: memberObjectId  
        },
        {
            $pull: { participants: memberObjectId }
        }
        );



        if (result.matchedCount === 0) {
            return res.status(200).json({
                message: "User was not in chat"
            });
        }

        const isAdmin = await AdminChat.exists({
            adminId : userId,
            chatId : chatId
        })

        if (!isAdmin){
            return res.status(403).send({
                message : "User must be a admin of chat to be able to remove user"
            })
        }

        return res.status(200).json({
            message: "User removed successfully"
        });

    } catch (err) {
        winstonLogger.error("Remove user from chat error", { error: err.message });

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
const deleteChat = async (req, res) => {
    try{
        const userId = req.headers["x-user-id"];
        const { chatId } = req.params;
        if (!chatId){
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        const isAdmin = await AdminChat.exists({
            adminId : userId,
            chatId : chatId
        })

        if (!isAdmin){
            return res.status(403).send({
                message : "User must be a admin of chat to be able to remove user"
            })
        }
        const deletedChat = await Chat.findByIdAndDelete(chatId);

        if (!deletedChat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        await AdminChat.deleteMany({ chatId });

        return res.status(200).json({
            message: "Chat deleted successfully"
        });
    }
    catch(err){
        winstonLogger.error("Deleting chat error", { error: err.message });

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { cursor, limit } = req.query;

        const userId = req.headers["x-user-id"];
        if (!chatId) {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        const chatObjectId = new mongoose.Types.ObjectId(chatId);

        let queryLimit = parseInt(limit, 10) || 20;
        queryLimit = Math.min(Math.max(queryLimit, 1), 50);

        const isParticipant = await Chat.exists({
            _id: chatObjectId,
            participants: userId
        });

        if (!isParticipant) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const query = {
            chatId: chatObjectId
        };

        if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
            query._id = {
                $lt: new mongoose.Types.ObjectId(cursor)
            };
        }

        const messages = await Message.find(query)
        .sort({ _id: -1 }) 
        .limit(queryLimit)
        .lean();

        messages.reverse();

        const nextCursor = messages.length > 0 ? messages[0]._id : null;

        return res.status(200).json({
            messages,
            nextCursor
        });

    } catch (err) {
        winstonLogger.error("Get messages error", {
            error: err.message
        });

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = { createChat, addUserToChat, removeUserFromChat, deleteChat, getMessages };