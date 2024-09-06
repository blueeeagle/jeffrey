const mongoose = require('mongoose');

const supperSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Types.ObjectId
    },
    date: {
        type: Date
    },
    item: [{
        items: {
            type: String,
        },
        description:{
            type: String,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    normalDate : {
        type : String,
    }
})

const supperData = new mongoose.model('supperData', supperSchema);
module.exports = supperData;
