require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
    authProxy,
    postProxy,
    commentProxy,
    followerProxy,
    notificationProxy,
    messageProxy
} = require("./middlewares/auth-proxy");
const { morganMiddleware } = require("./middlewares/morganLogger");
const { winstonLogger } = require("./utils/logger/winstonLogger");

const helmet = require("helmet");
const authenticate = require("./middlewares/authmiddleware");
const app = express();
const port = process.env.API_GATEWAY_PORT || 3000;

const allowedOrigins = ["http://localhost:5173"]; //frontend

app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["POST", "GET", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morganMiddleware);

app.use("/api/auth/test", authenticate, (req, res, next) => {
    req.headers["x-user-id"] = String(req.user.userId);
    next();
});
app.use("/api/auth/deleteUser", authenticate, (req, res, next) => {
    req.headers["x-user-id"] = String(req.user.userId);
    next();
});

app.use("/api/auth", authProxy);

app.use("/api/post", authenticate, (req, res, next) => {
    req.headers["x-user-id"] = String(req.user.userId);
    next();
}, postProxy);

app.use("/api/comment", authenticate, (req, res, next) => {
    req.headers["x-user-id"] = String(req.user.userId);
    next();
}, commentProxy);

app.use("/api/follower/", authenticate, (req, res, next) => {
    req.headers["x-user-id"] = String(req.user.userId);
    next();
}, followerProxy);

app.use("/api/notification/", authenticate, (req, res, next) => {
    req.headers["x-user-id"] = String(req.user.userId);
    next();
}, notificationProxy)

app.use("/api/message/", authenticate, (req, res, next) => {
    req.headers["x-user-id"] = String(req.user.userId);
    next();
}, messageProxy)


app.listen(port, () => {
        winstonLogger.info(`ApiGateway started on port ${port}`);
    }
);
