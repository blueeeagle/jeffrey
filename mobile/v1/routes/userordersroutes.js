var express = require('express');
var router = express.Router();
const vary = require('../../../middleware/authuser');

const userOrderControllers = require('../controllers/userorderscontrollers')

router.post('/orderhistory', vary, userOrderControllers.myOrdersListing)
router.post('/cancelOrder', vary, userOrderControllers.cancelOrder)
router.post('/newAddOrder', vary, userOrderControllers.addMethodOrder)
router.post('/sortOrder', vary, userOrderControllers.sortOrder)



module.exports = router;