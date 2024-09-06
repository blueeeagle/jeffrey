const mongoose = require("mongoose");


const reportsFoodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId
    },
    orderId: {
        type: mongoose.Types.ObjectId
    },
    foodId: {
        type: mongoose.Types.ObjectId
    },
    message: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const reportsFoodData = new mongoose.model('reportsFoodData', reportsFoodSchema);
module.exports = reportsFoodData;


