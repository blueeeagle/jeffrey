const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const JWT_SECRET = process.env.JWT_SECRET;

const adminSchema = new mongoose.Schema({

    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    password: {
        type: String,
    },
    image: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        enum: ["Admin", "Useradmin"]
    },
    token: {
        type: String,
    },
    resetToken:{
        type:String
    },
    created_at:{
        type:Date,
        default:new Date
    }

})
adminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log("normal password", this.password);
        this.password = await bcrypt.hash(this.password, 10);
        console.log("hash Pass Pass", this.password);
        next();
    }
});

adminSchema.methods.authToken = async function () {
    try {
        var adminSchema = this;

        console.log(adminSchema._id);
        var token = await jwt.sign({ _id: adminSchema._id }, JWT_SECRET, {
            expiresIn: "24h",
        });

        adminSchema.tokens = token;

        console.log(token);

        await adminSchema.save();

        return token;
    } catch (error) {
        console.log("auth token error", error);
    }
};
//caompare password
adminSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
  }

const adminData = mongoose.model("adminData", adminSchema);
module.exports = adminData; 