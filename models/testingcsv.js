const mongoose = require('mongoose');

const testingCsvSchema = new mongoose.Schema({

    userName: {
        type: String
    },
    Identifier: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },

})

const testingCsvData = new mongoose.model('testingCsvData', testingCsvSchema);
module.exports = testingCsvData;





// for (let i = 0; i < req.body.option.length; i++) {
//     arr.push({ items: req.body.option[i]})
// };