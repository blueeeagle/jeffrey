const mongoose = require("mongoose");

const lunchSchema = new mongoose.Schema({

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
    lunchId: {
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
    description: {
        type: String
    }

})

lunchSchema.index({ location: '2dsphere' });

const lunchData = new mongoose.model('OrderlunchData', lunchSchema);
module.exports = lunchData;
