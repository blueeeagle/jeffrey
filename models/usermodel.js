const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
require("dotenv").config();


const userSchema = new mongoose.Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    email: {
        type: String
    },
    countryCode: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    password: {
        type: String,
    },
    token: {
        type: String,
    },
    resetToken:{
        type:String
    },
    userImage: {
        type: String,
        Data: Buffer,
        default: null
    },
    deviceId: {
        type: String,
    },
    deviceType: {
        enum: ["web"],
        type: String,
    },
    userVerify: {
        type: Boolean,
        default: false,
    },
    isAdminApprove:{
        type:Boolean,
        default: false
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
    created_at:{
        type:Date,
        default: new Date
    },
    updated_at:{
        type:Date
    }

})

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
};

const userData = mongoose.model("userdata", userSchema);
module.exports = userData; 