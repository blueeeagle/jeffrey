const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const driverSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: `${process.env.BASE_URL}/assets/images/userImage.png`
  },
  password: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  address1: {
    type: String,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  vehicle: {
    vehicleBrand: {
      type: String,
      trim: true
    },
    vehicleModel: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    licensePlate: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    }
  },
  document: {
    licenseNumber: {
      type: String,
      trim: true
    },
    licenseIssueState: {
      type: String,
      trim: true
    },
    licenseImage: {
      type: String,
      trim: true
    },
    InsuranceImage: {
      type: String,
      trim: true
    }
  },
  token: {
    type: String
  },
  isAdminApprove: {
    type: Boolean,
    default: false
  },
  resetToken: {
    type: String
  },
  deviceToken: {
    type: String
  },
  deviceType: {
    type: String,
    enum: ['ios', 'android']
  },
  notificationStart: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isBlockByAdmin: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }
})

//generate Auth token
driverSchema.methods.userAuthToken = async function () {
  let userToken = this

  let token = await jwt
    .sign({ _id: userToken._id }, process.env.TOKEN_KEY, {
      expiresIn: 31556926
    })
    .toString()

  userToken.token = token

  await userToken.save()

  return token
}

// hash password using bcrypt
driverSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
  }
})

//caompare password
driverSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

const driverModel = mongoose.model('driverModel', driverSchema)

module.exports = driverModel
