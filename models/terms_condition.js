const mongoose = require('mongoose');

const termsConditionSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    UpdateAt: {
        type: Date,
        default: Date.now
    },


}, { timestamps: true })


const termsConditionData = new mongoose.model('termsConditionData', termsConditionSchema)
module.exports = termsConditionData;