var express = require('express');
var router = express.Router();
const vary = require('../../../middleware/authuser');

const orderControllers = require('../controllers/ordercontrollers')

router.post('/addingOrder' , vary , orderControllers.addingOrder)
router.post('/orderHistory' , vary , orderControllers.orderHistory)
router.post('/newAddOrder', vary, orderControllers.addMethodOrder)








module.exports = router;