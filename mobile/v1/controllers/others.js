const termsConditionModel = require('../../../models/terms_condition')
const aboutUs = require('../../../models/aboutus')

const contactUsModel = require('../../../models/contactUs')
const userData = require('../../../models/usermodel')



exports.termsCondition = async (req, res, next) => {
    try {

        const termsCondition = await termsConditionModel.find().lean()

        const mydata = Object.assign({}, ...termsCondition);

        res.send({ status: 1, message: "Terms condition", data: mydata.text })
    }
    catch (error) {
        res.send({ status: 0, message: "Something went wrong" })
    }
}


exports.aboutUs = async (req, res, next) => {
    try {

        const aboutUsData = await aboutUs.find().lean()

        const mydata = Object.assign({}, ...aboutUsData);

        res.send({ status: 1, message: "About Us", data: mydata.text })
    }
    catch (error) {
        res.send({ status: 0, message: "Something went wrong" })
    }
}


// contat us


exports.addContactUs = async (req, res, next) => {
    try {

        const userId = req.user._id
        const { description } = req.body

        if (!(userId, description)) {
            return res.send({ status: 0, message: "All input is required" })
        }

        const findUser = await userData.findOne({ _id: userId })

        if (findUser === null) {
            return res.send({ status: o, message: "User not found" })
        }

        const addingContactUs = new contactUsModel({
            userId: userId,
            description: description
        })

        console.log("addingContactUs=>>>>", addingContactUs)
        addingContactUs.save()
        res.send({ status: 1, message: 'Contact us added successfully' })

    }
    catch (error) {
        console.log("error=>>>>", error)
        res.send({ status: 0, message: "Something went wrong" })
    }
}