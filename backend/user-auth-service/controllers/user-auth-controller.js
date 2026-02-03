const StatusCodes = require("http-status-codes");


const User = require("../models/user_model.js");

const {loginInputValidation} = require("../middlewares/login-input-validation-middleware");
const {registerInputValidation} = require("../middlewares/register-input-validation-middleware");
const jwt = require("jsonwebtoken");
const {redisClient} = require("../utils/redisClient");
const cookieParser = require("cookie-parser");
const {winstonLogger} = require("../utils/logger/winstonLogger");
const {publishEvent} = require("../utils/rabbitmq");
const winston = require("winston");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
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
        return res.status(StatusCodes.OK).json({
            user: { id: user._id, username: user.username },
            token : accessToken,
            message: "Login successful"
        });
    } catch (err) {
        winstonLogger.error("Error logging in user", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Server error" });
    }
};
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username) return res.status(400).send({ message: "Username is required" });
        if (!email) return res.status(400).send({ message: "Email is required" });
        if (!password) return res.status(400).send({ message: "Password is required" });

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(409).send({ message: "User already exists" });
        }

        const newUser = await User.create({ username, email, password });
        winstonLogger.info("User registered in successfully");
        return res.status(201).json({
            message: "Registered successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        winstonLogger.error("Error registering user", err);
        return res.status(500).send({ message: "Server error" });
    }
};
const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
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
        userId: userId,
    });
    return res.status(200).send({
        message: "User deleted successfully",
    });
}

module.exports = {
    login,
    register,
    refresh,
    test,
    deleteUser,
};