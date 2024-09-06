const jwt = require('jsonwebtoken')
const driverModel = require("../models/driver")
const JWT_SECRET = process.env.TOKEN_KEY

const autheUser = async (req, res, next) => {
  try {
    if (!req.header('Authorization'))
      return res.status(401).json({status:0, message:"Please enter Token"});

    const token = req.header('Authorization').replace('Bearer', '')

    if (!token)
      return res.status(401).json({status:0, message:"Please enter valid token"});

    //decode the response
    const decoded = await jwt.verify(token, JWT_SECRET)
    console.log("decodee........", decoded)
    const user = await driverModel
      .findOne({
        _id: decoded._id,
        token: token
      })
      .lean()
    
    if (!user)
      return res.status(401).json({status:0, message:"Unauthorized User please login"});

    // req.token = token;
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({status:0, message:"Unauthorized User please login"});
  }
}

module.exports = autheUser;
