const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Name is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    }
})

module.exports = mongoose.model("User", UserSchema);