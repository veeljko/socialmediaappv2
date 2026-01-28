const winston = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, json, errors, printf } = winston.format;

const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    level : "error"
});

const prettyPrint = printf(({ level, message, timestamp, ...meta }) => {
    return `
[${timestamp}] ${level.toUpperCase()}:
${JSON.stringify({ message, ...meta }, null, 2)}
`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
    ),
    defaultMeta: {
        service: "api-gateway-service",
    },
    transports: [
        fileRotateTransport,
        new winston.transports.Console({
            format: combine(prettyPrint)
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: "logs/exceptions.log",
            format: combine(json())
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: "logs/rejections.log",
            format: combine(json())
        }),
    ],
    exitOnError: false,
});

module.exports = {winstonLogger : logger};


