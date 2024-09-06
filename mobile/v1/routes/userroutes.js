var express = require('express');
var router = express.Router();
const vary = require('../../../middleware/authuser');

const userControllers = require('../controllers/usercontrollers');
const s3image = require('../../../middleware/s3image');


// router.get('/:userId/:token', function (req, res) {
//     res.render('resetpass', { userId: req.params.userId, token: req.params.token, success: req.flash('success') });
// });

router.post('/registerUser', s3image.upload.single('userImage'), userControllers.singUp);
router.post('/loginUser', userControllers.login);
router.post('/userVerify', vary, userControllers.userVerify);
router.post('/changepassword', vary, userControllers.changepassword);
router.post('/updateprofile', vary, s3image.upload.single('userImage'), userControllers.editprofile);
router.post('/forgetpassword', userControllers.forgotEmailLink);
router.get('/userResetPassword', userControllers.webResetPass);
router.post('/userResetPassword', userControllers.resetPass);
router.post('/completeprofile', vary, userControllers.completeProfile)
router.post('/editAddress', vary, userControllers.editAddress)
router.post('/deleteAddress', vary, userControllers.deleteAddress)
router.get('/getProfile', vary, userControllers.getProfile)
router.post('/addNewAddressClient', vary, userControllers.addNewAddressClient)
router.get('/addressList', vary, userControllers.listOfAddress)
router.post('/makeAddressDefault', vary, userControllers.makeDefaultAddress)
router.get('/defaultAddress', vary,userControllers.getDefaultAddress)
router.get('/listNotifications', vary,userControllers.listNotification);
router.get('/countOfNotifications', vary,userControllers.countNotification);
router.post('/readNotifications', vary,userControllers.readNotification);
router.post('/deleteNotification', vary,userControllers.deleteNotification);
// router.post('/:userId/:token', userControllers.resetpass);
// router.post('/friends_list' , vary , userControllers.friends_list);
// router.post('/deleteUser' , vary , userControllers.user_soft_delete );

module.exports = router;