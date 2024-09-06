const vegetarianModel = require('../../../models/vegetarian');
const mongoose = require('mongoose');
const moment = require('moment');

exports.addVegetarian = async (req, res, next) => {
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

        const vegetarian = new vegetarianModel({
            categoryId:  new mongoose.Types.ObjectId("6570509fd4f3d1eb4741a387"),
            date: new Date(date),
            item: itemObjects,
            normalDate: formattedDate
        });

        console.log("vegetarian=>>>", vegetarian);
        await vegetarian.save();
        res.redirect('/addmenu');
    } catch (error) {
        console.log(error);
        res.redirect('/addmenu');
    }
};