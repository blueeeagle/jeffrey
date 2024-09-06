const mongoose = require('mongoose')
// const userdata= require('../models/usermodel')

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userdata'
  },
  orderItems: [
    {
      orderType: {
        type: String,
        enum: [
          'Breakfast',
          'Box Lunches',
          'Lunch',
          'PM Snacks',
          'Supper',
          'Vegetarian',
          'AM Snack'
        ]
      },
      quantity: {
        type: String
      },
      // menuDate: {
      //   type: String
      // },
      orderItem: [
        {
          items: {
            type: String
          },
          startTempValue: {
            type: Number,
            default: 0
          },
          endTempValue: {
            type: Number,
            default: 0
          },
          startTempDateAndTime: {
            type: Date
          },
          endTempDateAndTime: {
            type: Date
          }
        }
      ],
      description:{
        type: String
      },

    }
  ],
  orderDate: {
    type: Date
  },
  // description: {
  //   type: String
  // },
  includePlatesAndNapkins: {
    type: Boolean
  },
  isOrderAssign: {
    type: String,
    enum: ['Assigned', 'Not Assigned'],
    default: 'Not Assigned'
  },
  orderStatus: {
    enum: ['Upcoming', 'Delivered', 'Cancelled'],
    type: String,
    default: 'Upcoming'
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userAddressModel'
  },
  streetAddress: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  zipCode: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  locationName: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'] // Specify the type as "Point" for geospatial data
      // required: true,
    },
    coordinates: {
      type: [Number] // Array of [longitude, latitude] for coordinates
      // required: true,
    }
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'driverModel'
  },
  orderOtp: {
    type: String
  },
  orderPlacingDate: {
    type: Date
  },
  clientComments:{
    type:String
  },
  missingItems:{
    type:String
  },
  were_all_regular_menu_items_delivered:{
    type:Boolean
  },
  were_all_modified_and_vegetarian_items_delivered:{
    type:Boolean
  },
  receiveCustomerFirstName: {
    type: String
  },
  receiveCustomerLastName: {
    type: String
  },
  customerSignature: {
    type: String
  },
  isCustomerConfirmation: {
    type: Boolean,
    default: false
  },
  orderPDF: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }
})

orderSchema.index({ location: '2dsphere' })

const orderData = new mongoose.model('orderData', orderSchema)
module.exports = orderData
