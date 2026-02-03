require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const mongodbconnect = require("./utils/mongodbconnect");

const multer = require("multer");
const {loginInputValidation} = require("./middlewares/login-input-validation-middleware");
const {registerInputValidation} = require("./middlewares/register-input-validation-middleware");


const cookieParser = require("cookie-parser");
const {winstonLogger} = require("./utils/logger/winstonLogger");
const helmet = require("helmet");
const { morganMiddleware } = require("./middlewares/morganLogger");

const {
    login,
    register,
    refresh,
    test,
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


mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("UserAuthService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

app.listen(port, ()=>
    winstonLogger.info("User service listening on port " + port)
);