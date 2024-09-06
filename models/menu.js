const mongoose = require('mongoose');
const menuSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref:'userdata'
    },
    categoryId: {
        type: mongoose.Types.ObjectId,
        ref:'categoryData'
    },
    date: {
        type: Date
    },
    item: [{
        items: {
            type: String,
        }
    }],
    internal_notes:{
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = new mongoose.model('menu', menuSchema);
