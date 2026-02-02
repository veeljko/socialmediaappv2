const amqp = require("amqplib");
const { winstonLogger } = require("../utils/logger/winstonLogger");

let connection;
let channel;

const EXCHANGE_NAME = "post_events";

async function connectToRabbitMq() {
    try {
        if (!process.env.RABBITMQ_URL) {
            throw new Error("RABBITMQ_URL is not defined");
        }

        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, "topic", {
            durable: true,
        });

        winstonLogger.info("Connected to RabbitMQ");
        return channel;
    } catch (err) {
        winstonLogger.error({
            message: "Error connecting to RabbitMQ",
            error: err,
        });
        throw err;
    }
}

module.exports = { connectToRabbitMq };
