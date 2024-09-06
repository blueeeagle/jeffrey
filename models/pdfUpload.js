const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pdfSchema = new Schema({
    pdfName:{
        type: String,
    },
    fileUrl: {
        type: String,
        required: true
    },
    created_at:{
        type: Date,
        default: Date.now
    }
});

const monthPdf = mongoose.model('monthPdf', pdfSchema);

module.exports = monthPdf;
