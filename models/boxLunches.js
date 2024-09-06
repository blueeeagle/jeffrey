const mongoose = require('mongoose');

const boxLunchesSchema = new mongoose.Schema({
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

const boxLunchesData = new mongoose.model('boxLunchesData', boxLunchesSchema);
module.exports = boxLunchesData;
