const mongoose = require('mongoose');
const {winstonLogger} = require('./logger/winstonLogger')


async function connectToMongodb() {
    try {
        const connectionString = process.env.MONGODB_URI;
        await mongoose.connect(connectionString);

        console.log("MongoDB connected successfully");

    } catch (err) {
        console.error("Mongo connection failed:", err);
        throw err;
    }
}

mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
});

mongoose.connection.on("error", err => {
    console.log("MongoDB error:", err);
});

module.exports = { connectToMongodb };