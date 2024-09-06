const mongoose = require('mongoose')

const userAddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userData'
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
  created_at: {
    type: Date,
    default: new Date()
  },
  Updated_at: {
    type: Date
  }
})

userAddressSchema.index({ location: '2dsphere' })

const userAddressModel = mongoose.model('userAddressModel', userAddressSchema)
module.exports = userAddressModel
