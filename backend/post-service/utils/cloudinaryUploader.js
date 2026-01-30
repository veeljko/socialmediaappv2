const {winstonLogger} = require("./logger/winstonLogger");
const cloudinary = require('cloudinary').v2;

//CLOUDINARY_URL=cloudinary://693636851933719:7vBMve4AyqjFUFq9j77dDouVOhg@dcce8wb0x

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

async function uploadImage(mediaBuffer) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream((error, uploadResult) => {
                if (error) {
                    return reject(error);
                }
                resolve(uploadResult);
            })
            .end(mediaBuffer);
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