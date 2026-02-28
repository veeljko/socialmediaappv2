const StatusCodes = require("http-status-codes");
const User = require("../models/user_model.js");

const jwt = require("jsonwebtoken");
const {redisClient} = require("../utils/redisClient");
const {winstonLogger} = require("../utils/logger/winstonLogger");
const {publishEvent} = require("../utils/rabbitmq");
const { uploadImage, deleteMedia } = require("../utils/cloudinaryUploader");
const { resizeAvatar } = require("../utils/imageProccessor.js");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password").select("-createdAt").select("-updatedAt").select("-__v");;
        if (!user) return res.status(StatusCodes.BAD_REQUEST).send({ message: "Login failed" });

        const ok = await user.comparePassword(password);

        if (!ok) {
            return res.status(StatusCodes.BAD_REQUEST).send({ message: "Login failed" });
        }
        const userData = {
            userId : user._id,
        }
        const accessToken = jwt.sign(
            userData,
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn : '2h'}
        );
        const refreshToken = jwt.sign(
            userData,
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '24h'}
        )
        await redisClient.set(user._id, refreshToken, "EX", 86400);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });
        winstonLogger.info("User logged in successfully");
        
        return res.status(200).send({
            message : "Login successful",
            user : {
                id : userData.userId,
                ...user._doc,
                _id : undefined,
                password : undefined
            }
        })
        
    } catch (err) {
        winstonLogger.error("Error logging in user", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Server error" });
    }
};
const register = async (req, res) => {
    try {
        winstonLogger.info("REQ body", {...req.body});
        const { username, email, password, firstName, lastName,  } = req.body;
        winstonLogger.info("Trying to register user : ", {username, email, password, firstName, lastName});
        if (!username) return res.status(400).send({ message: "Username is required" });
        if (!email) return res.status(400).send({ message: "Email is required" });
        if (!password) return res.status(400).send({ message: "Password is required" });

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(409).send({ message: "User already exists" });
        }

        let avatar = {};

        if (req.file?.buffer) {
            try {
                const resizedBuffer = await resizeAvatar(req.file.buffer);
                const ans = await uploadImage(resizedBuffer);

                avatar = {
                    secure_url: ans.secure_url,
                    public_id: ans.public_id,
                    type: "image",
                };
            } catch (err) {
                winstonLogger.error("Avatar upload error", err);
                return res.status(400).send({
                message: "Avatar upload failed",
                });
            }
        }

        const newUser = await User.create({ username, email, password, firstName, lastName, avatar });
        winstonLogger.info("User registered in successfully");
        return res.status(201).json({
            message: "Registered successfully",
            user: {
                id : newUser._id,
                ...newUser._doc,
                _id : undefined,
                password : undefined
            },
        });
    } catch (err) {
        winstonLogger.error("Error registering user", err);
        return res.status(500).send({ message: "Server error" });
    }
};
const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    winstonLogger.info("Refresh token : ", refreshToken);
    if (!refreshToken) return res.status(StatusCodes.UNAUTHORIZED).send({message: "You are not logged in"});
    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        try{
            const redisRefreshToken = await redisClient.get(decoded.userId);
            if (redisRefreshToken !== refreshToken) return res.status(StatusCodes.UNAUTHORIZED).send({message: "You are not logged in"});
            const userData = {
                userId : decoded.userId,
            }
            const newAccessToken = jwt.sign(
                userData,
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn : '15m'}
            );
            const newRefreshToken = jwt.sign(
                userData,
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '24h'}
            )
            await redisClient.set(decoded.userId, newRefreshToken, "EX", 86400);

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000
            });
            winstonLogger.info("Token refreshed successfully");
            return res.status(StatusCodes.OK).json({
                token: newAccessToken,
                id : userData.userId,
                message: "Token refreshed"
            });
        }
        catch(err){
            winstonLogger.error("Error while retrieving token with redis", err);
        }
    }
    catch(err){
        winstonLogger.error("Error while accessing refresh endpoint", err);
        return res.status(500).send({ message: "Server error" });
    }
}
const test = (req, res) => {
    const userId = req.headers["x-user-id"];
    res.status(200).send({
        data : userId,
        message: "Login successful"
    })
}
const deleteUser = async (req, res) => {
    const userId = req.headers["x-user-id"];

    await User.findByIdAndDelete(userId);
    winstonLogger.info("User deleted successfully", userId);
    await publishEvent("user.deleted", {
        userId,
    });
    return res.status(200).send({
        message: "User deleted successfully",
    });
}
const me = async(req, res) => {
    const userId = req.headers["x-user-id"];
    winstonLogger.info("userId", userId);
    try{
        const user = await User.findById(userId).select("-createdAt").select("-updatedAt").select("-_id").select("-__v");
        winstonLogger.info("User found successfully", user);
        res.status(200).send({
            id : userId,
            ...user._doc
        })
    }
    catch(err){
        winstonLogger.error("Could not find user with specified id", userId);
        res.status(404).send({
            message : "Error while getting info about user"
        });
    }
}
const logout = async(req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
        message: "Logged out successfully",
    });
}
const getUserInfo = async(req, res) => {
    const userId = req.params.userId;
    const targetUser = await User.findById(userId).select("-createdAt").select("-updatedAt").select("-_id").select("-__v");;
    if (!targetUser){
        return res.status(404).send({
            message : "Error finding user with specified userId"
        })
    }
    return res.status(StatusCodes.OK).send({
        message : "User info found successfully",
        user : {
            ...targetUser._doc,
            id : userId,
            _id : undefined,
            password : undefined
        }
    })
}

module.exports = {
    login,
    register,
    refresh,
    test,
    deleteUser,
    me,
    logout,
    getUserInfo,
};