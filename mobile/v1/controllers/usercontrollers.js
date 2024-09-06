const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userData = require('../../../models/usermodel')
// const token = require('../../../models/token')
const adminNotificationData = require('../../../models/adminnotification')
// const sendEmail = require('../../../utils/sendmail')
const userAddressModel = require('../../../models/userAddress')
const notificationModel = require('../../../models/notification')
const forgotTemp = require('../../../middleware/sendLinkEmail')
const sendEmail = require('../../../utils/sendmail2')
const sendNotification = require('../../../middleware/sendNotification')
const adminData = require('../../../models/adminmodel')

exports.singUp = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      countryCode,
      mobileNumber,
      email,
      password,
      deviceId,
      deviceType
    } = req.body

    // Validate user input
    if (
      !(
        email &&
        password &&
        firstName &&
        lastName &&
        mobileNumber &&
        countryCode
      )
    ) {
      return res.send({ status: 0, message: 'all input is required'})
    } else {
      // check if user already exist
      const oldUser = await userData.findOne({ email: email })

      if (oldUser) {
        return res.send({
          status: 0,
          message: 'User Already Exist. Please Login'
        })
      }

      const alreadyUsedMobileNumber = await userData.findOne({
        mobileNumber: mobileNumber
      })

      if (alreadyUsedMobileNumber) {
        return res.send({
          status: 0,
          message: 'Please Used Another Mobile Number.'
        })
      }

      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(password, 10)

      let userImages;
      if (req.file && req.file.location){
        userImages = req.file.location
      }

      // Create user in our database
      const user = new userData({
        firstName: firstName,
        lastName: lastName,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        countryCode,
        mobileNumber,
        deviceId,
        deviceType,
        userImage: userImages,
        password: encryptedPassword
      })

      // Create token
      const userToken = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY
      )
      // save user token
      user.token = userToken
      await user.save()

      let resData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userImage: user.userImage,
        countryCode: user.countryCode,
        mobileNumber: user.mobileNumber,
        deviceId: user.deviceId,
        deviceType: user.deviceType,
        userVerify: user.userVerify,
        token: user.token,
        isComplete: user.isComplete
      }

      let adminPass = await adminData.findOne()

       // Send notification to the admin for new driver registration and profile approval
       let title = 'New Client Registration'
       let body = `A new Client has registered. Please review and approve their profile.`
       let type = 'new_client_registration'
 
       let data = {
         receiverId: adminPass._id, // Specify the admin's user ID here
         senderId: user._id, // Use the result of save() to get the driver's _id
         senderId_name: `${user.firstName} ${user.lastName}`,
         senderId_image:user.image,
         notificationSendTo: 'admin',
         title: title,
         body: body,
         type: type
       }
 
       await sendNotification(data)

      // return new user
      res.send({ status: 1, message: 'User Register Successfully', data: resData })
    }
  } catch (error) {
    console.log("errro......",error)
    res.send({ status: 0, message: 'Something went Wrong.' })
    console.log(error)
  }
}

// login
exports.login = async (req, res, next) => {
  try {
    // Get user input
    const { email, password, deviceId, deviceType } = req.body

    // Validate user input
    if (!(email && password)) {
      return res.send({ status: 0, message: 'All input is required' })
    }

    // Validate if user exists in our database
    const user = await userData.findOne({ email })

    if (!user) {
      return res.send({ status: 0, message: 'Email not found' })
    }

    // Check if user is approved by admin
    if (!user.isAdminApprove) {
      return res.send({
        status: 0,
        message: 'Your profile is not approved by admin'
      })
    }

    if (deviceId || deviceType) {
      let userOne = await userData.findByIdAndUpdate(
        user._id,
        { $set: { deviceId: deviceId, deviceType: deviceType } },
        { new: true }
      )
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY
      )

      // save user token
      user.token = token
      user.save()

      var data = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userImage: user.userImage,
        countryCode: user.countryCode,
        mobileNumber: user.mobileNumber,
        deviceId: user.deviceId,
        deviceType: user.deviceType,
        userVerify: user.userVerify,
        token: user.token,
        isComplete: user.isComplete,
        houseNumber: user.houseNumber,
        address: user.address,
        landMark: user.landMark,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        created_at: user.created_at
      }
      res.send({ status: 1, message: 'User login Successfully', data: data })
    } else {
      return res.send({ status: 0, message: 'Invalid Password' })
    }
  } catch (error) {
    console.log('error........', error)
    res.send({ status: 0, message: 'Something Went Wrong' })
  }
}

// userVerify
exports.userVerify = async (req, res, next) => {
  try {
    const userId = req.user._id

    const user = await userData.findOne({ _id: userId })

    if (user === null) {
      return res.send({ status: 0, message: 'User not found' })
    } else {
      user.userVerify = true
      user.save()
      res.send({ status: 1, message: 'User verified Successfully' })
    }
  } catch (error) {
    res.send({ status: 0, message: 'Something Wants Wrong' })
  }
}

// change password
exports.changepassword = async (req, res, next) => {
  try {
    const body = req.body

    const updatepass = await userData.findById(req.user._id)
    console.log(updatepass)

    if (!updatepass.validPassword(body.oldpassword))
      return res.send({ status: 0, message: 'Old password invalid' })

    if (body.oldpassword === body.newpassword)
      return res.send({ status: 0, message: 'This password already in use' })

    updatepass.password = await bcrypt.hash(body.newpassword, 12)

    const update = await userData.findByIdAndUpdate(
      { _id: req.user._id },
      updatepass
    )
    update.password = undefined
    update.__v = undefined
    res.send({
      Data: update,
      status: 1,
      message: 'Password changed successfully'
    })
  } catch (error) {
    res.send({ status: 0, message: 'Something Wants Wrong' })
  }
}

// update Profile
exports.editprofile = async (req, res, next) => {
  try {
    console.log('body test', req.body)
    console.log(req.file)

    if (req.file) {
      const result = await userData.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            userImage: req.file.location
          }
        },
        { new: true }
      )

      var newuser = result
      result.password = undefined

      res.send({
        data: newuser,
        status: 1,
        message: 'user Updated Successfully'
      })
    } else {
      const result = await userData.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber
          }
        },
        { new: true }
      )

      var newuser = result
      result.password = undefined
      res.send({
        data: newuser,
        status: 1,
        message: 'user Updated Successfully'
      })
    }
  } catch (error) {
    res.send({ status: 0, message: 'Something wants wrong' })
  }
}

//akif change in forgot password
exports.forgotEmailLink = async (req, res, next) => {
  try {
    const reqBody = req.body

    console.log(reqBody)
    let user = await userData.findOne({ email: reqBody.email })

    if (!user)
      return res.status(400).json({ status: 0, message: 'User not found' })

    let resetToken = await jwt.sign(
      { data: reqBody.email },
      process.env.TOKEN_KEY,
      {
        expiresIn: '1h'
      }
    )

    console.log('resetToken.....', resetToken)

    const updateLink = await userData.updateOne(
      { email: reqBody.email },
      { $set: { resetToken: resetToken } },
      { new: true }
    )

    let mailUrl =
      process.env.BASE_URL + '/api/users/userResetPassword?token=' + resetToken

    sendEmail(user.email, 'Forgot Password', forgotTemp({ url: mailUrl }))
    await user.save()

    res.status(200).json({
      status: 1,
      message: 'Please check your email to reset your password.'
    })
  } catch (error) {
    console.log('error.......', error)
    res.status(500).json({
      status: 0,
      message: 'Something went wrong please try again later.'
    })
  }
}

//render reset page
exports.webResetPass = async (req, res, next) => {
  try {
    if (req.query.token == undefined) {
      return res.send('Please enter a token or invalid')
    }

    let token = req.query.token

    let user = await userData.findOne({ resetToken: token })

    if (!user) return res.send('Invelid Link')

    res.render('userForgotEmailPage', { req: req })
  } catch (error) {
    res.status(500).json({ status: 0, message: USER.commonError })
  }
}

//resetpass forgot
exports.resetPass = async (req, res, next) => {
  try {
    let reqBody = req.body
    console.log('reqBody.......', reqBody)

    if (reqBody.newPassword != reqBody.confirmPassword) {
      req.flash('error_msg', 'confirm password not match')
      return res.redirect(
        process.env.BASE_URL +
          '/api/users/userResetPassword?token=' +
          reqBody.resetToken
      )
    }

    let user = await userData.findOne({
      resetToken: reqBody.resetToken
    })

    console.log('user....', user)

    if (!user) {
      req.flash('error_msg', 'link invelid')
      return res.redirect(
        process.env.BASE_URL +
          '/api/users/userResetPassword?token=' +
          reqBody.resetToken
      )
    } else {
      const password = await bcrypt.hash(reqBody.newPassword, 10)
      const updated_at = Date.now()

      const result = await userData.findByIdAndUpdate(
        { _id: user._id },
        {
          password: password,
          updated_at: updated_at,
          resetToken: null
        },
        { new: true }
      )
      return res.render('forgotMsgSuccess')
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: 'Something Went Wrong, Please Try Again Later'
    })
  }
}

// complete profile
exports.completeProfile = async (req, res, next) => {
  try {
    const userId = req.user._id

    const findUser = await userData.findOne({ _id: userId })

    if (findUser === null) {
      return res.send({ status: 0, message: 'user not found' })
    }

    const {
      houseNumber,
      address,
      landMark,
      city,
      state,
      zipCode,
      longitude,
      latitude
    } = req.body

    if (req.user.isComplete === true) {
      return res.send({ status: 0, message: 'Profile already complete' })
    }

    if (
      !(houseNumber,
      address,
      landMark,
      city,
      state,
      zipCode,
      longitude,
      latitude)
    ) {
      return res.send({ status: 0, message: 'All fildes been required' })
    }
    const location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    }

    findUser.houseNumber = houseNumber
    findUser.address = address
    findUser.landMark = landMark
    findUser.city = city
    findUser.state = state
    findUser.zipCode = zipCode
    findUser.isComplete = true
    findUser.location = location

    findUser.save()

    res.send({ status: 1, message: 'user Profile complete successfully' })
  } catch (error) {
    console.log('error=>>>', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//Akif work
//edit address
exports.editAddress = async (req, res, next) => {
  try {
    const {
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      longitude,
      latitude,
      // isDefault,
      locationName,
      addressId
    } = req.body
    const user = await userData.findById(req.user._id)

    if (!user) {
      return res.send({ status: 0, message: 'user not found' })
    }
    const userAddress = await userAddressModel.findOne({
      userId: user._id,
      _id: addressId
    })

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
    userAddress.streetAddress = streetAddress
      ? streetAddress
      : userAddress.streetAddress
    // userAddress.isDefault = isDefault?isDefault:userAddress.isDefault
    userAddress.phoneNumber = phoneNumber
      ? phoneNumber
      : userAddress.phoneNumber
    userAddress.city = city ? city : userAddress.city
    userAddress.state = state ? state : userAddress.state
    userAddress.zipCode = zipCode ? zipCode : userAddress.zipCode
    userAddress.location = location ? location : userAddress.location
    userAddress.locationName = locationName
      ? locationName
      : userAddress.locationName

    let result = await userAddress.save()
    if (result) {
      user.isComplete = true
      await user.save()
    }

    res.send({ status: 1, message: 'Update your Address successfully' })
  } catch (error) {
    console.log('error=>>>', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//get profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await userData.findById(req.user._id)

    if (!user) {
      return res.send({ status: 0, message: 'user not found' })
    }
    res.send({
      status: 1,
      message: 'Get profile retrive successfully',
      data: user
    })
  } catch (error) {
    console.log('error=>>>', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//add client new address
exports.addNewAddressClient = async (req, res, next) => {
  try {
    const {
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      locationName,
      longitude,
      latitude
    } = req.body

    const user = await userData.findById(req.user._id)

    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    // If this is the first address being added, set it as default
    const userAddressesCount = await userAddressModel.countDocuments({
      userId: user._id
    })

    if (userAddressesCount === 0) {
      const location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      }

      const newAddressAdd = new userAddressModel({
        userId: user._id,
        streetAddress: streetAddress,
        locationName: locationName,
        phoneNumber: phoneNumber,
        city: city,
        state: state,
        zipCode: zipCode,
        location: location,
        isDefault: true
      })

      user.isComplete = true
      await user.save()
      let save = await newAddressAdd.save()

      return res.send({
        status: 1,
        message: 'Your address has been successfully saved',
        data: save
      })
    } else {
      const location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      }

      const newAddressAdd = new userAddressModel({
        userId: user._id,
        streetAddress: streetAddress,
        locationName: locationName,
        phoneNumber: phoneNumber,
        city: city,
        state: state,
        zipCode: zipCode,
        location: location,
        isDefault: false
      })

      let save = await newAddressAdd.save()

      return res.send({
        status: 1,
        message: 'Your address has been successfully saved',
        data: save
      })
    }
  } catch (error) {
    console.log('Error: ', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//list of current user address
exports.listOfAddress = async (req, res, next) => {
  try {
    const user = await userData.findById(req.user._id)

    if (!user) {
      return res.send({ status: 0, message: 'user not found' })
    }

    const listofAddrsss = await userAddressModel.find({ userId: user._id })

    if (listofAddrsss) {
      res.send({
        status: 1,
        message: 'List of address retrive successfully',
        data: listofAddrsss
      })
    } else {
      res.send({
        status: 1,
        message: 'Not available address list'
      })
    }
  } catch (error) {
    console.log('error=>>>', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//make default address
exports.makeDefaultAddress = async (req, res, next) => {
  try {
    let { addressId, isDefault } = req.body
    const userId = req.user._id

    console.log('userId.....', userId)

    const user = await userData.findById(userId)

    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    const myAddress = await userAddressModel.findById(addressId)
    console.log('myAddress......', myAddress)
    if (!myAddress) {
      return res.send({ status: 0, message: 'Address not found for the user' })
    }

    if (isDefault === true) {
      // Set the current address as default
      myAddress.isDefault = isDefault

      // Set other addresses for the user as not default
      await userAddressModel.updateMany(
        { userId: userId, _id: { $ne: addressId } }, // Excluding the current address
        { $set: { isDefault: false } }
      )

      // Save the changes
      await myAddress.save()

      return res.send({ status: 1, message: 'Address set as default' })
    } else {
      return res.send({ status: 0, message: 'Invalid request' })
    }
  } catch (error) {
    console.log('Error: ', error)
    return res.send({ status: 0, message: 'Something went wrong' })
  }
}

exports.deleteAddress=async(req,res,next)=>{
  try {
    const user = await userData.findById(req.user._id)

    if (!user) {
      return res.send({ status: 0, message: 'user not found' })
    }
    const data =await userAddressModel.findByIdAndRemove(req.body.addressId)
    if(data){
      return res.send({ status: 1, message: 'Address deleted successfully' })
    }else{
      return res.send({ status: 0, message: 'Failed to delete Address' })
    }
  } catch (error) {
    console.log(error);
    return res.send({ status: 0, message: 'Something went wrong' })
  }
}
//get default address
exports.getDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user._id

    const user = await userData.findById(userId)

    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    const defaultAddressUser = await userAddressModel.findOne({
      userId: user._id,
      isDefault: true
    })

    if (defaultAddressUser) {
      return res.send({
        status: 1,
        message: 'Default address retrive',
        data: defaultAddressUser
      })
    } else {
      return res.send({ status: 1, message: 'You have not default address' })
    }
  } catch (error) {
    console.log('Error: ', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//get notification
exports.listNotification = async (req, res, next) => {
  try {
    const userId = req.user._id
    const user = await userData.findById(userId)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    const notificationAll = await notificationModel
      .find({
        receiverId: user._id
      })
      .sort({ notificationSendAt: -1 })

    if (notificationAll.length === 0)
      return res.send({ status: 0, message: 'Notfication Not Found' })

    res.send({ status: 1, message: 'get notification', data: notificationAll })
  } catch (error) {
    res.send({
      status: 0,
      message: 'Something went wrong please try again later.'
    })
  }
}

//get notification count
exports.countNotification = async (req, res, next) => {
  try {
    const userId = req.user._id
    const user = await userData.findById(userId)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    const notificationCount = await notificationModel.countDocuments({
      receiverId: user._id,
      isRead: false
    })
    res.send({
      status: 1,
      message: 'Count of Notification',
      data: { notificationCount: notificationCount }
    })
  } catch (error) {
    console.log('Error: ', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//read notifications
exports.readNotification = async (req, res, next) => {
  try {
    const userId = req.user._id
    const user = await userData.findById(userId)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    const notificationCount = await notificationModel.updateMany(
      { receiverId: user._id },
      {
        $set: {
          isRead: true
        }
      }
    )
    res.send({
      status: 1,
      message: 'Read all notifications suucessfully'
    })
  } catch (error) {
    res.send({
      status: 0,
      message: 'Something Went Wrong, Please Try Again Later'
    })
  }
}

// Delete selected notifications by ID
exports.deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.body;

    const user = await userData.findById(req.user._id);
    if (!user) {
      return res.send({ status: 0, message: 'User not found' });
    }

    // Check if the notification belongs to the authenticated user
    const notification = await notificationModel.findOne({ _id: notificationId, receiverId: user._id });
    if (!notification) {
      return res.send({ status: 0, message: 'Notification not found' });
    }

    const deleteResult = await notificationModel.findByIdAndDelete(notificationId);

    if (!deleteResult) {
      return res.send({
        status: 0,
        message: 'Something Went Wrong, Please Try Again Later'
      });
    }

    res.send({
      status: 1,
      message: 'Notification deleted successfully.'
    });
  } catch (error) {
    console.log('error.........', error);
    res.send({
      status: 0,
      message: 'Something Went Wrong, Please Try Again Later'
    });
  }
};

