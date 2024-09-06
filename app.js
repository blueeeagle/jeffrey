require('dotenv').config()
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
require('./DB/conn')
const hbs = require('hbs')
var session = require('express-session')
var flash = require('connect-flash')
const JWT_SECRET = process.env.JWT_SECRET
const moment = require('moment')
const cors = require('cors')
var passport = require('passport')
const axios = require('axios')
const momentTZ = require('moment-timezone')

// admin
const adminRoutes = require('./admin/v1/routes/admin')
const monthlyMenuModule = require('./admin/v1/routes/uploadMonthlyMenu')
const trainingModule = require('./admin/v1/routes/trainingPage')

// mobileRoutes
const userRoutes = require('./mobile/v1/routes/userroutes')
const filterUsingDateRoutes = require('./mobile/v1/routes/filterusingdateroutes')
const orderControllers = require('./mobile/v1/routes/userordersroutes')
const othersRouter = require('./mobile/v1/routes/others')
//akif
const driverRouter = require('./mobile/v1/routes/driver')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
hbs.registerPartials(path.join(__dirname + '/views/partials'))
app.use('/upload', express.static('upload'))

hbs.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1
})

hbs.registerHelper('if_eq', function (status, value) {
  return status === value
})
hbs.registerHelper('arrayIndex', function (array, index) {
  return array[index];
});
//breckfast and lunch, pm snacks
hbs.registerHelper('orderFor', orderFor => {
  if (orderFor === 'Breakfast') {
    return 'BREAKFAST'
  } else if (orderFor === 'Lunch') {
    return 'LUNCH'
  } else if (orderFor === 'Pmsnack') {
    return 'PM SNACK'
  }
})

hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this)
    case '!==':
      return v1 !== v2 ? options.fn(this) : options.inverse(this)
    case '<':
      return v1 < v2 ? options.fn(this) : options.inverse(this)
    case '<=':
      return v1 <= v2 ? options.fn(this) : options.inverse(this)
    case '>':
      return v1 > v2 ? options.fn(this) : options.inverse(this)
    case '>=':
      return v1 >= v2 ? options.fn(this) : options.inverse(this)
    default:
      return options.inverse(this)
  }
})

// Define a Handlebars helper
hbs.registerHelper('isActiveTab', function (currentTab, tabNumber) {
  return currentTab == tabNumber ? 'active' : ''
})

//select option selected
hbs.registerHelper('eq', function(arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

//UTC time convert into America/New_York
hbs.registerHelper('formatDate', function (dateTime, format) {
  if (format && dateTime) {
    var mydate = moment.utc(dateTime).tz('America/New_York'); // Convert UTC to America/New_York time zone
    console.log('mydate......', mydate);
    return mydate.format(format);
   }
});

//UTC time convert into America/New_York
hbs.registerHelper('formatDateNormal', function (dateTime, format) {
  if (format && dateTime) {
    var mydate = moment(dateTime); // Convert UTC to America/New_York time zone
    console.log('mydate......', mydate);
    return mydate.format(format);
   }
});

// Define a Handlebars helper to concatenate properties of nested objects
hbs.registerHelper('concatenateProperties', function (items) {
  let result = ''
  items.forEach(item => {
    console.log('item,,,,', item.items)

    // Assuming 'propertyName' is a property you want to display
    if (item.items) {
      result += item.items + ' ' // Concatenate properties with a space
    }
    // Add more conditions if you have other properties to display
  })
  return result.trim() // Trim to remove trailing space
})

hbs.registerHelper('selectSidebar', function (role, option) {
  if (role === 'Admin') {
    return option.fn(this)
  } else {
    return option.inverse(this)
  }
})

//check order status
hbs.registerHelper('orderStatus', function (status, options) {
  if (status === 'Delivered') {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

//cors policy
app.use(cors())

//session
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
//passport
require('./middleware/passport')(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use(async function (req, res, next) {
  // res.locals.adminLogin = req.session.adminLogin;
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.isAdmin = req.user && req.user.role === 'Admin'
  res.locals.isSubAdmin = req.user && req.user.role === 'Useradmin'
  res.locals.adminLogin = req.user
  res.locals.BASE_URL = process.env.BASE_URL
  next()
})

//clear cache
app.use(function (req, res, next) {
  res.set(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  )
  next()
})

app.use('/', adminRoutes)
app.use('/monthlyMenu', monthlyMenuModule)
app.use('/trainingPage', trainingModule)

// mobile
app.use('/api/users', userRoutes)
app.use('/api/filter', filterUsingDateRoutes)
app.use('/api/order', orderControllers)
app.use('/api/others', othersRouter)
app.use('/api/driver', driverRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
