const express = require('express')
const router = express.Router()
const driverAuths = require('../../../middleware/driverAuth')
const uploadImage = require('../../../middleware/s3image')
const driverController = require('../../v1/controllers/driverController')

//register
router.post(
  '/register',
  uploadImage.upload.fields([
    { name: 'image' },
    { name: 'licenseImage' },
    { name: 'InsuranceImage' }
  ]),
  driverController.registerUser
)
//login
router.post('/login', driverController.Login)
//password reset
router.post('/resetPassword', driverAuths, driverController.changePassword)
router.post(
  '/updateProfile',
  driverAuths,
  uploadImage.upload.single("image"),
  driverController.updateUser
)
router.post('/vehicleUpdate', driverAuths, driverController.updateVehicle)
router.post(
  '/documentUpdate',
  driverAuths,
  uploadImage.upload.fields([
    { name: 'licenseImage' },
    { name: 'InsuranceImage' }
  ]),
  driverController.updateDocument
)
router.get("/getUserDetails", driverAuths,driverController.getProfile)
router.post('/forgotLinkSend', driverController.forgotEmailLink);
router.get('/userResetPassword', driverController.webResetPass);
router.post('/userResetPassword', driverController.resetPass);
router.post('/homePage', driverAuths,driverController.homePage);
router.post('/filterOrder', driverAuths,driverController.filterOrder);
router.post('/clientList', driverAuths,driverController.clientList);
router.post('/settingNotifications', driverAuths,driverController.notificationSetting);
router.get('/listNotifications', driverAuths,driverController.listNotification);
router.get('/countOfNotifications', driverAuths,driverController.countNotification);
router.post('/readNotifications', driverAuths,driverController.readNotification);
router.post('/ordersDetials', driverAuths, driverController.orderDetails)
router.post('/startTempValueUpdate',driverAuths, driverController.saveStartTemprature)
router.post('/endtTempValueUpdate',driverAuths, driverController.endStartTemprature)
router.post('/completeDelivery',uploadImage.upload.single('customerSignature'), driverAuths, driverController.deliveryComplete)
router.post('/listCompleteDelivery',driverAuths ,driverController.listCompleteDelivery)
router.post('/deleteAccount',driverAuths ,driverController.deleteAccount)



module.exports = router
