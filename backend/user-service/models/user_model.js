const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        select: false,
    },
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
});


userSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();

    if (!update?.password) return;

    const saltRounds = 10;
    update.password = await bcrypt.hash(update.password, saltRounds);

    this.setUpdate(update);
});


userSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
