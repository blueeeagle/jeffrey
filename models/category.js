const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema ({


    name : {
        type : String,
        required : true,
        unique : true,
    },


})


const categoryData = new mongoose.model('categoryData', categorySchema);
module.exports = categoryData;


