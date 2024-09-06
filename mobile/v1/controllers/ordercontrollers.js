const orderModel = require('../../../models/ordermodel')
const userModel = require('../../../models/usermodel')
const moment = require('moment')

// exports.addOrder = async (req, res, next) => {
//     try {

//         const { latitude, longitude, orderDate, address, mobileNumber } = req.body
//         const userId = req.user._id

//         if (!userId) {
//             return res.send({ status: 0, message: "User not found" })
//         }
//         if (!req.body) {
//             return res.send({ status: 0, message: "All input filds is required" })
//         }

//         const location = {
//             type: 'Point',
//             coordinates: [longitude, latitude],
//         };

//         const addOrder = new orderModel({
//             userId: userId,
//             lunchId: req.body.lunchId,
//             breakFastId: req.body.breakFastId,
//             pmSnakeId: req.body.pmSnakeId,
//             address: address,
//             mobileNumber: mobileNumber,
//             // orderTime : orderTime,
//             orderDate: orderDate,
//             location: location

//         })

//         console.log("addOrder=>>>>", addOrder)
//         addOrder.save()
//         res.send({ status: 1, message: "Order added successfully" })

//     }
//     catch (error) {
//         console.log("error", error)
//         res.send({ status: 0, message: "Something went wrong" })
//     }
// }

// orders History
// exports.ordersHistory = async (req, res, next) => {
//     try {
//         const userId = req.user._id
//         const orderStatus = req.body.orderStatus
//         var myOrders

//         if (orderStatus === "Upcoming") {

//             const breakfast = await orderModel.aggregate([

//                 {
//                     $match: {
//                         userId: userId,
//                         orderStatus: "Upcoming"
//                     }
//                 },

//                 {
//                     $lookup: {
//                         from: 'breakfastdatas',
//                         localField: 'breakFastId',
//                         foreignField: '_id',
//                         as: 'breakFastId',
//                     },
//                 },
//                 { $unwind: '$breakFastId' },
//                 {
//                     $lookup: {
//                         from: 'categorydatas',
//                         localField: 'breakFastId.categoryId',
//                         foreignField: '_id',
//                         as: 'breakFastId.categoryId',
//                     },
//                 },
//                 { $unwind: '$breakFastId.categoryId' },

//                 //   {
//                 //     $lookup: {
//                 //       from: 'lunchdatas',
//                 //       localField: 'lunchId',
//                 //       foreignField: '_id',
//                 //       as: 'lunchId',
//                 //     },
//                 //   },

//                 //   {
//                 //     $lookup: {
//                 //       from: 'pmsnaksdatas',
//                 //       localField: 'pmSnakeId',
//                 //       foreignField: '_id',
//                 //       as: 'pmSnakeId',
//                 //     },
//                 //   },

//                 {
//                     $sort: {
//                         orderDate: -1, // Sort in descending order based on the "date" field
//                     },
//                 }

//             ])

//             const lunch = await orderModel.aggregate([

//                 {
//                     $match: {
//                         userId: userId,
//                         orderStatus: "Upcoming"
//                     }
//                 },

//                 {
//                     $lookup: {
//                         from: 'lunchdatas',
//                         localField: 'lunchId',
//                         foreignField: '_id',
//                         as: 'lunchId',
//                     },
//                 },
//                 { $unwind: '$lunchId' },
//                 {
//                     $lookup: {
//                         from: 'categorydatas',
//                         localField: 'lunchId.categoryId',
//                         foreignField: '_id',
//                         as: 'lunchId.categoryId',
//                     },
//                 },
//                 { $unwind: '$lunchId.categoryId' },

//                 //   {
//                 //     $lookup: {
//                 //       from: 'pmsnaksdatas',
//                 //       localField: 'pmSnakeId',
//                 //       foreignField: '_id',
//                 //       as: 'pmSnakeId',
//                 //     },
//                 //   },

//                 {
//                     $sort: {
//                         orderDate: -1, // Sort in descending order based on the "date" field
//                     },
//                 }

//             ])

//             const pmSnack = await orderModel.aggregate([

//                 {
//                     $match: {
//                         userId: userId,
//                         orderStatus: "Upcoming"
//                     }
//                 },

//                 {
//                     $lookup: {
//                         from: 'pmsnaksdatas',
//                         localField: 'pmSnakeId',
//                         foreignField: '_id',
//                         as: 'pmSnakeId',
//                     },
//                 },
//                 { $unwind: '$pmSnakeId' },
//                 {
//                     $lookup: {
//                         from: 'categorydatas',
//                         localField: 'pmSnakeId.categoryId',
//                         foreignField: '_id',
//                         as: 'pmSnakeId.categoryId',
//                     },
//                 },
//                 { $unwind: '$pmSnakeId.categoryId' },

//                 {
//                     $sort: {
//                         orderDate: -1, // Sort in descending order based on the "date" field
//                     },
//                 }

//             ])

//             console.log("breakfast=>>", breakfast, "lunch=>>", lunch, "pmSnack=>>", pmSnack)

//             const allOrders = [];

//             // Push data from 'data', 'lunch', and 'pmSnack' arrays into 'allOrders'
//             allOrders.push(...breakfast, ...lunch, ...pmSnack);

//             // Sort 'allOrders' by the 'orderDate' field in ascending order
//             allOrders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));

//             console.log(allOrders);

//             const orderHistory = []

//             allOrders.map(item => {
//                 const obj = {}
//                 console.log("item=>>", item)

//                 obj._id = item._id
//                 obj.orderDate = item.orderDate
//                 obj.breakFastId = item.breakFastId._id
//                 obj.categoryName = item.breakFastId.categoryId.name
//                 obj.items = item.item
//                 obj.orderStatus = item.orderStatus

//             })
//             res.send({ data: allOrders })

//         }
//         else if (orderStatus === "Upcoming") {

//         }
//         else {
//             return res.send({ status: 0, message: "Enter valid  orderStatus" })
//         }

//         // console.log("myOrders=>>" , myOrders)

//     }
//     catch (error) {
//         console.log("error", error)
//     }
// }

// add order
exports.addingOrder = async (req, res, next) => {
  try {
    const userId = req.user._id
    console.log('userId', userId)
    const { items, orderDate, address, mobileNumber, longitude, latitude } =
      req.body

    if (!(userId, orderDate, orderTime, address, mobileNumber)) {
      return res.send({ status: 0, message: 'All input fields are required' })
    }

    const breakFastId = req.body.breakFastId
    const lunchId = req.body.lunchId
    const pmSnakeId = req.body.pmSnakeId

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    }

    const breakFastSchema = {
      breakFastId: breakFastId
    }

    const lunchSchema = {
      lunchId: lunchId
    }

    const pmSnakeSchema = {
      pmSnakeId: pmSnakeId
    }

    const addingOrder = new orderModel({
      userId: userId,
      orderDate: orderDate,
      orderTime: orderTime,
      address: address,
      mobileNumber: mobileNumber,
      location: location,
      breakFastStatus: breakFastSchema,
      lunchFastStatus: lunchSchema,
      pmSnakeStatus: pmSnakeSchema
    })

    console.log('addingOrder=>>>>', addingOrder)
    addingOrder.save()
    return res.send({ status: 1, message: 'Order added successfully' })
  } catch (error) {
    res.send({ status: 0, message: 'Something went wrong' })
  }
}

// order history
exports.orderHistory = async (req, res, next) => {
  try {
    const userId = req.user._id

    const orderStatus = req.body.orderStatus

    const breakFastStatus = await orderModel.aggregate([
      {
        $match: {
          userId: userId,
          'breakFastStatus.orderStatus': orderStatus
        }
      },

      {
        $lookup: {
          from: 'breakfastdatas',
          localField: 'breakFastStatus.breakFastId',
          foreignField: '_id',
          as: 'breakFastStatus.breakFastId'
        }
      },
      { $unwind: '$breakFastStatus.breakFastId' }
    ])

    const lunchStatus = await orderModel.aggregate([
      {
        $match: {
          userId: userId,
          'lunchFastStatus.orderStatus': orderStatus
        }
      },

      {
        $lookup: {
          from: 'lunchdatas',
          localField: 'lunchFastStatus.lunchId',
          foreignField: '_id',
          as: 'lunchFastStatus.lunchId'
        }
      },
      { $unwind: '$lunchFastStatus.lunchId' }
    ])

    const pmSnackStatus = await orderModel.aggregate([
      {
        $match: {
          userId: userId,
          'pmSnakeStatus.orderStatus': orderStatus
        }
      },

      {
        $lookup: {
          from: 'pmsnaksdatas',
          localField: 'pmSnakeStatus.pmSnakeId',
          foreignField: '_id',
          as: 'pmSnakeStatus.pmSnakeId'
        }
      },

      { $unwind: '$pmSnakeStatus.pmSnakeId' }
    ])

    console.log(
      'lunchStatus=>>>>>',
      lunchStatus,
      breakFastStatus,
      pmSnackStatus
    )

    res.send({ lunchStatus, breakFastStatus, pmSnackStatus })
  } catch (error) {
    console.log('error=>>>>', error)
  }
}

//order
exports.addMethodOrder = async (req, res, next) => {
  try {
    const { items, description, addressId } = req.body
    const user = await userModel.findById(req.user._id)
    if (!user) {
      return res.send({ status: 0, message: 'User not found' })
    }
    const newOrder = new orderModel({
        orderCode:"4356",
        userId:user._id,
        items:items,
        orderDate:moment().format(),
        // description:description,
        addressId:addressId
    })

    const save = await newOrder.save();
    res.send({status:1, message:"Your order successfully created", data:save})
  } catch (error) {
    console.log('error......', error)
    res.send({ status: 0, message: 'Something went wrong' })
  }
}
