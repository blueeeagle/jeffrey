const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const adminData = require('../models/adminmodel')

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },

      async function (email, password, done) {
        try {
          const admin = await adminData.findOne({ email: email})
          // if (admin.isActive===false) {
          //   return done(null, false, { message: 'You should not access it at this time.' })
          // }

          if (!admin) {
            return done(null, false, { message: 'Please Enter valid Email' })
          }
          if (!admin.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password' })
          }
          return done(null, admin)
        } catch (error) {
          console.log(error)
          return done(error)
        }
      }
    )
  )
}

//session store for database
passport.serializeUser(function (admin, done) {
   done(null, admin._id)
})

//fetch data using admin id
passport.deserializeUser(async function (id, done) {
  try {
    let admin = await adminData.findById(id)
    return done(null, admin)
  } catch (error) {
    return done(error, null)
  }
})
