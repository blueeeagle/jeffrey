const addBreakfast = require('../../../models/addbreakfast')
const addLunch = require('../../../models/addlunch')
const pmSnack = require('../../../models/addpmsnake')
const Category=require('../../../models/category')
const UserData = require('../../../models/usermodel')
const Menu=require('../../../models/menu')
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

exports.addMenu = async (req, res, next) => {
    try {

        console.log("req.body+>>>", req.body)
        console.log("body=>>>", req.body.date)

        const formattedDate = moment(req.body.date).format('DD-MM-YYYY');
        console.log("formattedDate=>>", formattedDate)

        // const data = [req.body.option]
        // var arr = []
        const data = Array.isArray(req.body.option) ? req.body.option : [req.body.option]; // Ensure data is an array
        const arr = data.map(item => ({ items: item }));


        const addBreakfasts = new addBreakfast({
            categoryId: "6516bd6c062cc562bf14348a",
            date: req.body.date,
            item: arr,
            normalDate: formattedDate

        })

        console.log("addBreakfasts=>>", addBreakfasts)

        const addLunchs = new addLunch({
            categoryId: "6516bb717866404ee4bfdb17",
            date: req.body.date,
            item: arr,
            normalDate: formattedDate

        })
        console.log("addLunchs", addLunchs)

        const addPmSnacks = new pmSnack({
            categoryId: "6516bda2062cc562bf14348e",
            date: req.body.date,
            item: arr,
            normalDate: formattedDate


        })

        console.log("addPmSnacks=>>", addPmSnacks, "addBreakfasts=>>>>", addBreakfasts, "addLunchs=>>>>", addLunchs)



        // await addBreakfasts.save()
        // await addLunchs.save()
        // await addPmSnacks.save()
        // res.redirect('/addmenu')

    }

    catch (error) {
        console.log(error)
        res.redirect('/addmenu')


    }
}
// exports.AddMenu = async (req, res, next) => {
//     try {
//         const userId = req.body.userId;

//         if (!req.file || !req.file.path) {
//             req.flash("error_msg", "Excel file is required");
//             return res.redirect('/addcsvmenu');
//         }

//         // Fetch the Excel file path
//         const filePath = req.file.path;

//         // Read and parse the Excel file
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

//         // Skip header row
//         const rows = data.slice(1);

//         // Process categories
//         const categoryMap = {};
//         const categories = await Category.find({}).exec();
//         categories.forEach(category => {
//             categoryMap[category.name] = category._id;
//         });

//         // Process menu items
//         const menuPromises = rows.map(async (row) => {
//             const [date, category, items] = row;
//             let storeDate;
//             if (typeof date === 'number') {
//                 storeDate = moment((date - 25569) * 86400 * 1000).format("YYYY-MM-DD");
//             } else {
//                 storeDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");
//             }
//             // Find the categoryId
//             const categoryId = categoryMap[category] || null;

//             // Process items
//             const itemArray = items.split(',').map(item => ({ items: item.trim() }));
// console.log(date,"dATE");
//             const menuItem = new Menu({
//                 userId,
//                 date: storeDate,
//                 categoryId: categoryId,
//                 item: itemArray
//             });

//             return menuItem.save();
//         });

//         try {
//             await Promise.all(menuPromises);
//             console.log("Menu items saved successfully.");
//             req.flash("success_msg", "Client's monthly menu added successfully.");
//             res.redirect('/addcsvmenu');
//         } catch (error) {
//             console.log(error);
//             req.flash("error_msg", "Error saving menu items.");
//             res.redirect('/addcsvmenu');
//         } finally {
//             // Clean up: Delete the file after processing
//             fs.unlink(filePath, (err) => {
//                 if (err) console.error("Error deleting file:", err);
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         req.flash("error_msg", "Something went wrong");
//         res.redirect('/addcsvmenu');
//     }
// };
exports.AddMenu = async (req, res, next) => {
  try {
    const userId = req.body.userId;

    if (!req.file || !req.file.path) {
      req.flash("error_msg", "Excel file is required");
      return res.redirect('/addcsvmenu');
    }

    // Fetch the Excel file path
    const filePath = req.file.path;

    // Read and parse the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Skip header row
    const rows = data.slice(1);

    // Process categories
    const categoryMap = {};
    const categories = await Category.find({}).exec();
    categories.forEach(category => {
      categoryMap[category.name] = category._id;
    });

    // Extract the month and year from the first row's date for comparison
    let monthYearStart = null;
    let monthYearEnd = null;
    const firstDateCell = rows[0][0];
    if (typeof firstDateCell === 'number') {
      monthYearStart = moment((firstDateCell - 25569) * 86400 * 1000).startOf('month').toDate();
      monthYearEnd = moment((firstDateCell - 25569) * 86400 * 1000).endOf('month').toDate();
    } else {
      monthYearStart = moment(firstDateCell, "YYYY-MM-DD").startOf('month').toDate();
      monthYearEnd = moment(firstDateCell, "YYYY-MM-DD").endOf('month').toDate();
    }

    // Delete existing menu items for the same month and year
    await Menu.deleteMany({
      userId,
      date: { $gte: monthYearStart, $lte: monthYearEnd }
    });

    // Process menu items
    const menuPromises = rows.map(async (row) => {
      const [date, category, items, internalNotes] = row;
      let storeDate;
      if (typeof date === 'number') {
        storeDate = moment((date - 25569) * 86400 * 1000).format("YYYY-MM-DD");
      } else {
        storeDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");
      }

      // Find the categoryId
      const categoryId = categoryMap[category] || null;

      // Process items
      const itemArray = items.split(',').map(item => ({ items: item.trim() }));
      console.log(date, "dATE");

      const menuItem = new Menu({
        userId,
        date: storeDate,
        categoryId: categoryId,
        item: itemArray,
        internal_notes: internalNotes
      });

      return menuItem.save();
    });

    try {
      await Promise.all(menuPromises);
      console.log("Menu items saved successfully.");
      req.flash("success_msg", "Client's monthly menu added successfully.");
      res.redirect('/addcsvmenu');
    } catch (error) {
      console.log(error);
      req.flash("error_msg", "Error saving menu items.");
      res.redirect('/addcsvmenu');
    } finally {
      // Clean up: Delete the file after processing
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Something went wrong");
    res.redirect('/addcsvmenu');
  }
};