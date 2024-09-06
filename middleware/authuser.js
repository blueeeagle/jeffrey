const jwt = require("jsonwebtoken");

var userData = require('../models/usermodel');
require("dotenv").config();


const config = process.env;


const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.header("Authorization");

  if (!token) {
    return res.status(403).send({ status: 0, message: "A token is required for authentication" })
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    // req.user = decoded;
    // console.log("111111111111111111111",req.user);
    const user = await userData.findOne({ _id: decoded.user_id })

    if (!user) {
      return res.send({ status: 0, message: "User not found" })
    }

    req.user = user
    console.log("logged USer:");
    console.log(req.user);
  } catch (err) {
    return res.status(401).send({ status: 0, message: "Invalid Token" })
  }
  return next();
};


module.exports = verifyToken;