const mongoose = require('mongoose');

const lunchSchema = new mongoose.Schema({

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

const lunchData = new mongoose.model('lunchData', lunchSchema);
module.exports = lunchData;





// for (let i = 0; i < req.body.option.length; i++) {
//     arr.push({ items: req.body.option[i]})
// };