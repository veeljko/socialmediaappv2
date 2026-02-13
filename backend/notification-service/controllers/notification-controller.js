const Notification = require("../models/notification-model")
const {winstonLogger} = require("../utils/logger/winstonLogger")

const getNotifications = async (req, res) => {
    const userId = req.headers["x-user-id"];
    const cursor = req.query.cursor;
    let limit = req.query.limit;
    if (limit) limit = parseInt(limit);
    else limit = 5;

    if (cursor){
        const ans = await Notification.find({
            _id : {$lt : cursor},
            recipientId : userId,
        }).sort({ _id : -1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find Notifications");
            return res.status(404).send({
                message: "Could not find Notifications"
            })
        }

        const newCursor = Object.values(ans).at(-1);
        return res.status(200).send({
            notifications: ans,
            cursor : newCursor
        })
    }
    else{
        const ans = await Notification.find({
            recipientId : userId
        }).sort({_id : -1}).limit(limit).exec()

        if (!ans){
            winstonLogger.error("Could not find Notifications");
            return res.status(404).send({
                message: "Could not find Notification"
            })
        }

        const cursor = Object.values(ans).at(-1);
        return res.status(200).send({
            notifications : ans,
            cursor : cursor
        })
    }
}

module.exports = {getNotifications}