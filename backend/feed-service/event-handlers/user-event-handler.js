const { winstonLogger } = require("../utils/logger/winstonLogger");

const handleUserDeleted = async (info) => {
    winstonLogger.info({
        message: "User Deleted Handler for Feed Service",
        info,
    });
};

module.exports = { handleUserDeleted };
