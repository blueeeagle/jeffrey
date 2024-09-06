const addLunch = require('../../../models/addlunch');
const mongoose = require('mongoose');
const moment = require('moment');


// exports.addLunch = async (req, res, next) => {
//     try {

//         console.log("req.body=>>>", req.body)
//         const formattedDate = moment(req.body.date).format('DD-MM-YYYY');
//         console.log("formattedDate=>>", formattedDate)

//         // const data = [req.body.option]
//         // var arr = []
//         const data = Array.isArray(req.body.option) ? req.body.option : [req.body.option]; // Ensure data is an array
//         const arr = data.map(item => ({ items: item }));

//         const addLunchs = new addLunch({
//             categoryId: "6516bb717866404ee4bfdb17",
//             date: req.body.date,
//             item: arr,
//             normalDate: formattedDate

//         })
//         console.log("addLunchs=>>>", addLunchs)
//         addLunchs.save()
//         res.redirect('/addmenu')

//     }

//     catch (error) {
//         console.log(error)
//         res.redirect('/addmenu')

//     }
// }




exports.addLunch = async (req, res, next) => {
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

        const addLunchs = new addLunch({
            categoryId:  new mongoose.Types.ObjectId("6516bb717866404ee4bfdb17"),
            date: new Date(date),
            item: itemObjects,
            normalDate: formattedDate
        });


        await addLunchs.save();
        res.redirect('/addmenu');
    } catch (error) {
        console.log(error);
        res.redirect('/addmenu');
    }
};