const mongoose = require('mongoose');

const pmSnaksSchema = new mongoose.Schema({

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

const pmSnaksData = new mongoose.model('pmSnaksData', pmSnaksSchema);
module.exports = pmSnaksData;





// for (let i = 0; i < req.body.option.length; i++) {
//     arr.push({ items: req.body.option[i]})
// };