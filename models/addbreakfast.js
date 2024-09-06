const mongoose = require('mongoose');

const breakFastSchema = new mongoose.Schema({
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

const breakFastData = new mongoose.model('breakFastData', breakFastSchema);
module.exports = breakFastData;
