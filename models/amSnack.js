const mongoose = require('mongoose');

const amSnackSchema = new mongoose.Schema({
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

const amSnackData = new mongoose.model('amSnackData', amSnackSchema);
module.exports = amSnackData;
