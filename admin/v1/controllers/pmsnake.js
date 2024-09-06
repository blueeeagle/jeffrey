const addPmSnack = require('../../../models/addpmsnake')
const moment = require('moment');
const mongoose = require('mongoose');


// exports.addPmSnack = async (req, res, next) => {
//     try {

//         console.log("req.body=>>>", req.body)
//         const formattedDate = moment(req.body.date).format('DD-MM-YYYY');
//         console.log("formattedDate=>>", formattedDate)
//         // const data = [req.body.option]
//         // var arr = []
//         const data = Array.isArray(req.body.option) ? req.body.option : [req.body.option]; // Ensure data is an array
//         const arr = data.map(item => ({ items: item }));

//         const addPmSnacks = new addPmSnack({
//             categoryId: "6516bda2062cc562bf14348e",
//             date: req.body.date,
//             item: arr,
//             normalDate: formattedDate


//         })
//         console.log("addPmSnacks=>>>", addPmSnacks)
//         addPmSnacks.save()
//         res.redirect('/addmenu')
//     }
//     catch (error) {
//         console.log(error)
//     }
// }

exports.addPmSnack = async (req, res, next) => {
    try {
        console.log("req.body=>>>", req.body);

        const date = req.body.date;
        if (!date) {
            throw new Error('Date is missing or invalid.');
        }

        const selesctTime =  moment(date, 'YYYY-MM-DD','America/New_York')
        const formattedDate = selesctTime.format('DD-MM-YYYY');
        console.log("formattedDate=>>", formattedDate);

        const items = Array.isArray(req.body['item[]']) ? req.body['item[]'] : [req.body['item[]']];
        const descriptions = Array.isArray(req.body['description[]']) ? req.body['description[]'] : [req.body['description[]']];
     
        if (items.length !== descriptions.length) {
            throw new Error('Items and descriptions arrays must have the same length.');
        }

        const itemObjects = [];
        for (let i = 0; i < items.length; i++) {
            itemObjects.push({
                items: items[i],
                description: descriptions[i]
            });
        }

        const addPmSnacks = new addPmSnack({
            categoryId:  new mongoose.Types.ObjectId("6516bda2062cc562bf14348e"),
            date: new Date(date),
            item: itemObjects,
            normalDate: formattedDate
        });


        await addPmSnacks.save();
        res.redirect('/addmenu');
    } catch (error) {
        console.log(error);
        res.redirect('/addmenu');
    }
};
