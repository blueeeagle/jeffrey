const otpGenerator = require('otp-generator')

exports.onlyNumber = otp_length => {
    return otpGenerator.generate(otp_length, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false
    })
  }