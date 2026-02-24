require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const mongodbconnect = require("./utils/mongodbconnect");

const multer = require("multer");
const {loginInputValidation} = require("./middlewares/login-input-validation-middleware");
const {registerInputValidation} = require("./middlewares/register-input-validation-middleware");

const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq")

const cookieParser = require("cookie-parser");
const {winstonLogger} = require("./utils/logger/winstonLogger");
const helmet = require("helmet");
const { morganMiddleware } = require("./middlewares/morganLogger");

const {handleUserFollow, handleUserUnFollow} = require("./event-handlers/user-follow-events");

const {
    login,
    register,
    refresh,
    test,
    deleteUser,
    me,
    logout,
    getUserInfo,
} = require("./controllers/user-auth-controller");

const app = express();
const port = process.env.USER_SERVICE_PORT || 3001;
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(morganMiddleware);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

app.post("/login", upload.none(), loginInputValidation, login);
app.post("/register", upload.single("avatar"), registerInputValidation, register);
app.post("/refresh", refresh);
app.get("/test", test)
app.delete("/deleteUser", deleteUser);
app.get("/me", me);
app.post("/logout", logout);
app.get("/get-user-info/:userId", getUserInfo)


mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("UserAuthService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

async function startServer(){
    try{
        await connectToRabbitMQ();

        await consumeEvent("user.followed", handleUserFollow);
        await consumeEvent("user.unfollowed", handleUserUnFollow);

        const port = process.env.USER_SERVICE_PORT || 3001;
        app.listen(port, ()=>
            winstonLogger.info("User Auth service listening on port " + port)
        );
    }
    catch(err){
        winstonLogger.error("Error starting the server", err);
        process.exit(1);
    }
}
startServer();