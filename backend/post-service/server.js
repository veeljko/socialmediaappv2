require("dotenv").config();
const StatusCodes = require("http-status-codes");
const express = require("express");
const app = express();
const Post = require("./models/post-model");
const mongodbconnect = require("./utils/mongodbconnect");

const multer = require("multer");
const upload = new multer();

const {winstonLogger} = require("./utils/logger/winstonLogger");
const helmet = require("helmet");
const { morganMiddleware } = require("./middlewares/morganLogger");

const { uploadImage } = require("./utils/cloudinaryUploader");

app.use(helmet());
app.use(morganMiddleware);

app.post("/create-post", upload.array("media"), async (req, res) => {
    const userId = req.headers["x-user-id"];
    const media = [];
    for (const file of req.files) {
        const ans = await uploadImage(req.files[0].buffer);
        media.push({
            secure_url: ans.secure_url,
            public_id: ans.public_id,
            type: "image",
        })
    }
    if (!req.body.content && media.length === 0) {
        return res.status(400).json({ message: "Post cannot be empty" });
    }

    try {
        const newPost = await Post.create({
            authorId: userId,
            content: req.body.content,
            mediaUrls: media,
        })


        return res.status(200).send({
            message: "Post created successfully!",
        })
    }
    catch (err) {
        winstonLogger.error("Error while creating the post", err);
        res.status(400).send({
            message: "Error while creating the post",
        })
    }
});

mongodbconnect.connectToMongodb().then(() => {
    winstonLogger.info("PostService connected to MongoDB");
}).catch(err =>
    winstonLogger.error("Error connecting to MongoDB", err)
);

const port = process.env.POST_SERVICE_PORT || 3002;
app.listen(port, ()=>
    winstonLogger.info("Post service listening on port " + port)
);