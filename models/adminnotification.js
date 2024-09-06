const mongoose = require("mongoose")
const adminNotificationSchema = new mongoose.Schema({

    sender_id: {
        type: mongoose.Types.ObjectId
    },
    reciver_id: {
        type: mongoose.Types.ObjectId
    },
    notification_body: {
        type: String
    },
    // 1 for new user register
    notification_type: {
        type: Number,
    },
    module_id: {
        type: mongoose.Types.ObjectId
    },
    module_name: {
        type: String
    },
    title: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

})

const adminNotificationDate = mongoose.model("adminNotificationDate", adminNotificationSchema);
module.exports = adminNotificationDate;

