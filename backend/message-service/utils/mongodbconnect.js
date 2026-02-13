const mongoose = require('mongoose');
const {winstonLogger} = require('./logger/winstonLogger')

async function connectToMongodb() {
    try {
        const connectionString = process.env.MONGODB_URI;
        await mongoose.connect(connectionString);
    } catch (err) {
        return err;
    }
}

module.exports = { connectToMongodb };