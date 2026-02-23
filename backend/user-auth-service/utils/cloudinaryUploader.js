const {winstonLogger} = require("./logger/winstonLogger");
const cloudinary = require('cloudinary').v2;

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

async function uploadImage(mediaBuffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "avatars",
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(mediaBuffer);
    });
}

async function deleteMedia(publicId) {
    try{
        await cloudinary.uploader.destroy(publicId);
    }
    catch(error){
        winstonLogger.error("Error while deleting media from cloudinary", error);
    }
}

module.exports = {uploadImage, deleteMedia};