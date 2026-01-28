require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { authProxy } = require("./middlewares/auth-proxy");
const { morganMiddleware } = require("./middlewares/morganLogger");
const { winstonLogger } = require("./utils/logger/winstonLogger");

const helmet = require("helmet");
const winston = require("winston");
const app = express();
const port = process.env.API_GATEWAY_PORT || 3000;

const allowedOrigins = ["http://localhost:5173"]; //frontend

app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morganMiddleware);

app.use("/api/auth", authProxy);

app.listen(port, () => {
        winstonLogger.info(`ApiGateway started on port ${port}`);
    }
);
