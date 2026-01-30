const winston = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, json, errors, printf } = winston.format;

const prettyPrint = printf(({ level, message, timestamp, ...meta }) => {
    return `
[${timestamp}] ${level.toUpperCase()}:
${JSON.stringify({ message, ...meta }, null, 2)}
`;
});

const fileErrorExport = new winston.transports.DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    level : "error",
    format: combine(prettyPrint)
});

const fileHttpExport = new winston.transports.DailyRotateFile({
    filename: "logs/http-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "31d",
    level : "http",
    format: combine(prettyPrint)
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "http",
    format: combine(prettyPrint),
    defaultMeta: {
        service: "user-auth-service",
    },
    transports: [
        fileErrorExport,
        fileHttpExport,
        new winston.transports.Console({
            format: combine(prettyPrint)
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: "logs/exceptions.log",
            format: combine(prettyPrint)
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: "logs/rejections.log",
            format: combine(prettyPrint)
        }),
    ],
    exitOnError: false,
});

module.exports = {winstonLogger : logger};


