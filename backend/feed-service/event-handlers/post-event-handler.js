const { winstonLogger } = require("../utils/logger/winstonLogger");

const handlePostDeleted = async (info) => {
    winstonLogger.info({
        message: "Post Deleted Handler for Feed Service",
        info,
    });
};

module.exports = { handlePostDeleted };
