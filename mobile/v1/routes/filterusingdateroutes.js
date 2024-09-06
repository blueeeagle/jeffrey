var express = require('express');
var router = express.Router();
const vary = require('../../../middleware/authuser');

const filterUsingDate = require ('../../../mobile/v1/controllers/filterusingdate')

router.post('/filterusingdate' , vary , filterUsingDate.findusingdate)
router.get('/monthlyData', vary , filterUsingDate.mounthlyMenu)


module.exports = router;