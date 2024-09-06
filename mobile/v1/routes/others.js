var express = require('express');
var router = express.Router();
const vary = require('../../../middleware/authuser');
const othersControllers = require('../controllers/others.js')

router.post('/terms_condition', othersControllers.termsCondition);
router.post('/aboutUs', othersControllers.aboutUs)
// addContactUs
router.post('/addContactUs', vary, othersControllers.addContactUs)






module.exports = router;