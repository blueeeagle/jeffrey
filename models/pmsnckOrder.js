const mongoose = require("mongoose");

const pmSnackSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Types.ObjectId,
    },
    orderDate: {
        type: Date
    },
    filterDate: {
        type: String
    },
    day: {
        type: String
    },
    orderTime: {
        type: Date
    },
    pmSnackId: {
        type: mongoose.Types.ObjectId,
    },
    orderStatus: {
        enum: ["Upcoming", "Delivered", "Cancelled", "AutomaticCancelled"],
        type: String,
        default: "Upcoming"
    },
    address: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    description: {
        type: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // Specify the type as "Point" for geospatial data
            required: true,
        },
        coordinates: {
            type: [Number], // Array of [longitude, latitude] for coordinates
            required: true,
        },
    },
    quantity: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now()
    },



})

pmSnackSchema.index({ location: '2dsphere' });

const pmSnackData = new mongoose.model('OrderPmSnackData', pmSnackSchema);
module.exports = pmSnackData;
