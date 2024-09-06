const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true,

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


const aboutUsData = new mongoose.model('aboutUsData', aboutUsSchema)
module.exports = aboutUsData;