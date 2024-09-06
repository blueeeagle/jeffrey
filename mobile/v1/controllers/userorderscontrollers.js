const breakFastModel = require('../../../models/breakfastOrder.js')
const lunchModel = require('../../../models/lunchOrder.js')
const pmSnackModel = require('../../../models/pmsnckOrder.js')
const moment = require('moment')
const mongoose = require('mongoose')
const orderModel = require('../../../models/ordermodel')
const userModel = require('../../../models/usermodel')
const randomCode = require('../../../middleware/geretorCode')
const sendNotification = require('../../../middleware/sendNotification')
const userAddressModel = require('../../../models/userAddress.js')
const driverModel = require('../../../models/driver')

// my Orders History
exports.myOrdersListing = async (req, res, next) => {
  try {
    const orderStatus = req.body.orderStatus
    const sortBy = req.body.sortBy
    const startDate = req.body.startDate
    const endDate = req.body.endDate
    const addressId = req.body.addressId
    const user = await userModel.findById(req.user._id)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    if (sortBy === 'date') {
      if (startDate && endDate) {
        const start = moment(startDate, 'MM-DD-YYYY')
          .startOf('day')
          .toISOString()
        const end = moment(endDate, 'MM-DD-YYYY').endOf('day').toISOString()

        console.log('start......', start, end)

        const orders = await orderModel
          .find({
            userId: user._id,
            orderStatus: orderStatus,
            orderDate: { $gt: start, $lt: end }
          })
          .sort({ orderDate: -1 })

        const formattedOrders = orders.map(order => ({
          ...order._doc,
          orderDate: moment(order.orderDate).format('MM-DD-YYYY')
        }))

        if (formattedOrders.length > 0) {
          return res.send({
            status: 1,
            message: 'Order list retrieved successfully',
            data: formattedOrders
          })
        } else {
          return res.send({
            status: 0,
            message: 'No orders available within this date range'
          })
        }
      } else {
        return res.send({
          status: 0,
          message: 'Please select a date range.'
        })
      }
      // Replace 'createdAt' with your order's date field
    } else if (sortBy === 'locationName') {
      if (addressId) {
        const orders = await orderModel
          .find({ userId: user._id, addressId: addressId })
          .sort({ orderDate: -1 })

        const formattedOrders = orders.map(order => ({
          ...order._doc,
          orderDate: moment(order.orderDate).format('MM-DD-YYYY')
        }))

        if (formattedOrders.length > 0) {
          return res.send({
            status: 1,
            message: 'Order list retrieved successfully',
            data: formattedOrders
          })
        } else {
          return res.send({
            status: 0,
            message: 'No orders available for this location'
          })
        }
      } else {
        return res.send({
          status: 0,
          message: 'Please provide a valid addressId for location search'
        })
      }

      //   const locationRegex = new RegExp(req.body.location, 'i') // 'i' flag for case insensitivity

      //   myAllOrder = await orderModel
      //     .find({ userId: user._id, orderStatus: orderStatus })
      //     .populate({ path: 'addressId' })

      //   myAllOrder = myAllOrder.filter(order => {
      //     const locationName = order.addressId.locationName.toLowerCase()
      //     console.log('orderDate......', locationName, req.body.location)
      //     return locationRegex.test(locationName)
      //   })

      //   if (myAllOrder.length > 0) {
      //     return res.send({
      //       status: 1,
      //       message: 'My order list',
      //       data: myAllOrder
      //     })
      //   }
      // } else {
      //   myAllOrder = await orderModel
      //     .find({ userId: user._id, orderStatus: orderStatus })
      //     .populate({ path: 'addressId' })
      //     .sort({ orderDate: -1 })

      //   if (myAllOrder.length > 0) {
      //     return res.send({
      //       status: 1,
      //       message: 'My order list',
      //       data: myAllOrder
      //     })
      //   } else {
      //     return res.send({
      //       status: 0,
      //       message: 'No orders available for the specified criteria'
      //     })
      //   }
    } else {
      console.log('test.........')
      const orders = await orderModel
        .find({
          userId: user._id,
          orderStatus: orderStatus
        })
        .sort({ orderDate: -1 })

      const formattedOrders = orders.map(order => ({
        ...order._doc,
        orderDate: moment(order.orderDate).format('MM-DD-YYYY')
      }))

      if (formattedOrders.length > 0) {
        return res.send({
          status: 1,
          message: 'Order list retrieved successfully',
          data: formattedOrders
        })
      } else {
        return res.send({
          status: 0,
          message: 'No orders available within this date range'
        })
      }
    }
  } catch (error) {
    console.log('error=>>>>>', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

// cancel orders
exports.cancelOrder = async (req, res, next) => {
  try {
    const orderId = new mongoose.Types.ObjectId(req.body.orderId)
    const orderStatus = req.body.orderStatus

    const user = await userModel.findById(req.user._id)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }

    const order = await orderModel.findById(orderId)
    if (!order) {
      res.send({ status: 0, message: 'OrderId is required.' })
    }

    if (orderStatus === 'Cancelled') {
      order.orderStatus = orderStatus
      await order.save()
      return res.send({
        status: 1,
        message: 'Your ordre successfully canceled'
      })
    } else {
      return res.send({ status: 0, message: 'Something went wrong' })
    }
  } catch (error) {
    console.log('error=>>>>>', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

//new order
exports.addMethodOrder = async (req, res,next) => {
  try {
    const { orders, description, addressId, includePlatesAndNapkins } = req.body // Assuming the orders array is sent in the request body

    const user = await userModel.findById(req.user._id)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }
    const address = await userAddressModel.findById(addressId)
    if (!address) {
      return res.send({ status: 0, message: 'Address not found' })
    }
    const savedOrders = []

    for (const order of orders) {
      let randomGenerator = randomCode.onlyNumber(4)
      const myFormateDate = moment(order.orderDate).format('YYYY-MM-DD')
      const location = {
        type: 'Point',
        coordinates: [
          address.location.coordinates[0], // longitude
          address.location.coordinates[1], // latitude
        ],
      };
      const newOrder = new orderModel({
        orderCode: randomGenerator,
        userId: user._id,
        orderDate: myFormateDate,
        orderItems: order.orderItems,
        description: description,
        includePlatesAndNapkins: includePlatesAndNapkins,
        addressId: addressId,
        streetAddress:address.streetAddress,
        city:address.city,
        state:address.state,
        zipCode:address.zipCode,
        phoneNumber:address.phoneNumber,
        isDefault:address.isDefault,
        locationName:address.locationName,
        location:location
      })

      const savedOrder = await newOrder.save()
      savedOrders.push({
        ...savedOrder._doc,
        orderDate: moment(savedOrder.orderDate).format('MM-DD-YYYY')
      })

      // Notification to Admin
      let adminNotification = {
        senderId: user._id,
        senderId_image: user.userImage,
        senderId_name: `${user.firstName} ${user.lastName}`,
        notificationSendTo: 'admin',
        orderId: savedOrder._id,
        title: 'New Order Received',
        body: `A new order has been received on ${savedOrder.orderDate}.`,
        type: 'new_order'
      }

      await sendNotification(adminNotification)
      // Notification to Customer
      let customerNotification = {
        receiverId: user._id,
        senderId: user._id,
        senderId_image: user.userImage,
        senderId_name: `${user.firstName} ${user.lastName}`,
        notificationSendTo: 'customer',
        orderId: savedOrder._id,
        title: 'Your Order Has Been Placed Successfully!',
        body: `Dear ${user.firstName}, 
  Your order has been successfully placed. Your order code is ${savedOrder.orderCode}. 
  Thank you for choosing us!`,
        type: 'new_order'
      }

      await sendNotification(customerNotification)
    }
    res.status(200).json({
      status: 1,
      message: 'Orders saved successfully',
      data: savedOrders
    })
  } catch (error) {
    console.log('error......', error)
    res.status(500).json({
      status: 0,
      message: 'Failed to save orders',
      error: error.message
    })
  }
}

//reporting sorting orders
exports.sortOrder = async (req, res, next) => {
  try {
    const { keyWord, startDate, endDate, addressId } = req.body

    const user = await userModel.findById(req.user._id)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }
    if (keyWord === 'date') {
      if (startDate && endDate) {
        const start = moment(startDate, 'MM-DD-YYYY')
          .startOf('day')
          .toISOString()
        const end = moment(endDate, 'MM-DD-YYYY').endOf('day').toISOString()

        console.log('start......', start, end)

        const orders = await orderModel
          .find({
            userId: user._id,
            orderDate: { $gt: start, $lt: end }
          })
          .sort({ orderDate: -1 })

        const formattedOrders = orders.map(order => ({
          ...order._doc,
          orderDate: moment(order.orderDate).format('MM-DD-YYYY')
        }))

        if (formattedOrders.length > 0) {
          return res.send({
            status: 1,
            message: 'Order list retrieved successfully',
            data: orders
          })
        } else {
          return res.send({
            status: 0,
            message: 'No orders available within this date range'
          })
        }
      } else {
        return res.send({
          status: 0,
          message: 'Please select start date and end date'
        })
      }
    } else {
      if (addressId) {
        const orders = await orderModel
          .find({ userId: user._id, addressId: addressId })
          .sort({ orderDate: -1 })

        const formattedOrders = orders.map(order => ({
          ...order._doc,
          orderDate: moment(order.orderDate).format('MM-DD-YYYY')
        }))

        if (formattedOrders.length > 0) {
          return res.send({
            status: 1,
            message: 'Order list retrieved successfully',
            data: orders
          })
        } else {
          return res.send({
            status: 0,
            message: 'No orders available for this location'
          })
        }
      } else {
        return res.send({
          status: 0,
          message: 'Please provide a valid addressId for location search'
        })
      }
    }
  } catch (error) {
    console.log('error......', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}
