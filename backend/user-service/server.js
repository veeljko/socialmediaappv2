require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const mongoose = require("mongoose");
const mongodbconnect = require("./helpers/mongodbconnect");
const User = require("./models/user_model.js");
const multer = require("multer");
const {loginInputValidation} = require("./middlewares/login-input-validation-middleware");
const {registerInputValidation} = require("./middlewares/register-input-validation-middleware");
const jwt = require("jsonwebtoken");
const {redisClient} = require("./helpers/redisClient");
const cookieParser = require("cookie-parser");
const authenticate = require("./middlewares/authmiddleware");

const app = express();
const port = process.env.USER_SERVICE_PORT || 3001;
app.use(express.json());
app.use(cookieParser());

const upload = new multer();

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/login", upload.none(), loginInputValidation, async (req, res) => {
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
            {expiresIn : '15m'}
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

        return res.status(StatusCodes.OK).json({
            user: { id: user._id, username: user.username },
            token : accessToken,
            message: "Login successful"
        });
    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Server error" });
    }
});

app.post("/register", upload.none(), registerInputValidation, async (req, res) => {
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

        return res.status(201).json({
            message: "Registered successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Server error" });
    }
});

app.post("/refresh", async (req, res) => {
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

            return res.status(StatusCodes.OK).json({
                token: newAccessToken,
                message: "Token refreshed"
            });
        }
        catch(err){
            console.log("Error while retrieving token with redis", err);
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).send({ message: "Server error" });
    }
})

app.get("/test", authenticate, (req, res) => {
    const data = req.user;
    res.status(200).send({
        data,
        message: "Login successful"
    })
})


mongodbconnect.connectToMongodb().then(() => {
    console.log("UserService connected to MongoDB");
}).catch(err =>
    console.log(err)
);

app.listen(port, ()=>
    console.log(`User service app listening on port ${port}!`)
);