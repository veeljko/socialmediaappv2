require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const mongodbconnect = require("./utils/mongodbconnect");

const multer = require("multer");
const {loginInputValidation} = require("./middlewares/login-input-validation-middleware");
const {registerInputValidation} = require("./middlewares/register-input-validation-middleware");

const { connectToRabbitMQ } = require("./utils/rabbitmq")

const cookieParser = require("cookie-parser");
const {winstonLogger} = require("./utils/logger/winstonLogger");
const helmet = require("helmet");
const { morganMiddleware } = require("./middlewares/morganLogger");

const {
    login,
    register,
    refresh,
    test,
    deleteUser,
} = require("./controllers/user-auth-controller");

const app = express();
const port = process.env.USER_SERVICE_PORT || 3001;
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morganMiddleware);

const upload = new multer();

app.post("/login", upload.none(), loginInputValidation, login);
app.post("/register", upload.none(), registerInputValidation, register);
app.post("/refresh", refresh);
app.get("/test", test)
app.delete("/deleteUser", deleteUser);


mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("UserAuthService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

async function startServer(){
    try{
        await connectToRabbitMQ();
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