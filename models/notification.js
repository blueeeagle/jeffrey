const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel'
  },
  adminId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"adminData"
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel'
  },
  senderId_name: {
    type: String
  },
  senderId_image: {
    type: String
  },
  notificationTitle: {
    type: String,
    trim: true
    // required: [true, "Title is required"],
    // max: [30, "Title should not be more than 30 letters"],
  },
  notificationBody: {
    type: String,
    trim: true
    // required: [true, "Body is required"],
    // max: [120, "Body should not be more than 120 letters"],
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"orderData"
  },
  orderCode:{
    type:String
  },
  orderDate:{
    type:Date
  },
  orderAddressName:{
    type:String
  },
  isRead:{
    type:Boolean,
    default:false
  },
  notificationSendTo:{
    type:String
  },
  notificationSendAt:{
    type:Date
  },
  notificationType: {
    type: String,
    trim: true
  },
  isReadByReceiver: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default:Date.now
  },
  updated_at:{
    type:Date
  }
})

const notificationModel = mongoose.model('notificationModel', notificationSchema)
module.exports = notificationModel