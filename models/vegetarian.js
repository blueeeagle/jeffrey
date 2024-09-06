const mongoose = require('mongoose');

const vegetarianSchema = new mongoose.Schema({
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

const vegetarianData = new mongoose.model('vegetarianData', vegetarianSchema);
module.exports = vegetarianData;
