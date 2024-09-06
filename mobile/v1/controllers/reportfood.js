const reportFoodModel = require('../../../models/reportfood')

exports.repoartFood = async (req, res, next) => {
    try {

        const userId = req.user._id

        if (!userId) {
            return res.send({ status: 0, message: "user not found" })
        }

        const reportUser = new reportFoodModel({
            userId: userId,
            orderId: req.body.orderId,
            foodId: req.body.foodId,
            message: req.body.message,

        })
        console.log("reportUser=>>>>>>>>>>", reportUser)

    }
    catch (error) {
        console.log("error=>>>>", error)
    }
}