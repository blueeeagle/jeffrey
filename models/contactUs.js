const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId
    },
    description: {
        type: String
    },
    isGivenReply: {
        type: Boolean,
        default: false
    },
    createdAt: {

        type: Date,
        default: Date.now()
    },
    UpdateAt: {
        type: Date,
        default: Date.now()

    },


}, { timestamps: true })


const contactUsData = new mongoose.model('contactUsData', contactUsSchema)
module.exports = contactUsData;