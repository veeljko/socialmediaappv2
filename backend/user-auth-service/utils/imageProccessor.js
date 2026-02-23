const sharp = require("sharp");

async function resizeAvatar(buffer) {
  return await sharp(buffer)
    .resize(256, 256, {
      fit: "cover",          // cropuje višak (Instagram style)
      position: "center",
    })
    .jpeg({ quality: 80 })   // kompresija
    .toBuffer();
}

module.exports = { resizeAvatar };