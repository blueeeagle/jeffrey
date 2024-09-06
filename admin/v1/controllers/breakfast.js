const addBreakfast = require("../../../models/addbreakfast");
const mongoose = require("mongoose");
const categoryData = require("../../../models/category");
const addLunch = require("../../../models/addlunch");
const addPmSnack = require("../../../models/addpmsnake");
const supperModel = require("../../../models/supper");
const vegetarianModel = require("../../../models/vegetarian");
const amSnackModel = require("../../../models/amSnack");
const boxLunchesModel = require("../../../models/boxLunches");
const moment = require("moment");
const momentTz = require("moment-timezone");

exports.addBreakfast = async (req, res, next) => {
  try {
    console.log("req.body=>>>", req.body);

    const category = await categoryData.findOne({ _id: req.body.categoryId });

    let items = Array.isArray(req.body["item"])
      ? req.body["item"]
      : [req.body["item"]];
    console.log("items...", items);
    let itemsOne = items.map((item) => {
      // Use items instead of req.body.item
      return { items: item };
    });
    let menuDate = req.body.date;
    if (!menuDate) {
      req.flash("error_msg", "Date is missing or invalid.");
      throw new Error("Date is missing or invalid.");
    }

    if (category.name === "Breakfast") {
      const addBreakfasts = new addBreakfast({
        categoryId: category._id,
        date: moment.utc(menuDate).tz("America/New_York").format(),
        item: itemsOne,
        normalDate: moment
          .utc(menuDate)
          .tz("America/New_York")
          .format("MM-DD-YYYY"),
      });
      await addBreakfasts.save();
      req.flash("success_msg", "Add Breakfast Menu Successfully.");
      return res.redirect("/addmenu");
    } else if (category.name === "Lunch") {
      const addlunch = new addLunch({
        categoryId: category._id,
        date: moment.utc(menuDate).tz("America/New_York").format(),
        item: itemsOne,
        normalDate: moment
          .utc(menuDate)
          .tz("America/New_York")
          .format("MM-DD-YYYY"),
      });
      await addlunch.save();
      req.flash("success_msg", "Add Lunch Menu Successfully.");
      return res.redirect("/addmenu");
    } else if (category.name === "PM Snacks") {
      const addPmSnacks = new addPmSnack({
        categoryId: category._id,
        date: moment.utc(menuDate).tz("America/New_York").format(),
        item: itemsOne,
        normalDate: moment
          .utc(menuDate)
          .tz("America/New_York")
          .format("MM-DD-YYYY"),
      });
      await addPmSnacks.save();
      req.flash("success_msg", "Add PM Snacks Menu Successfully.");
      return res.redirect("/addmenu");
    } else if (category.name === "Vegetarian") {
      const addVegetarianModels = new vegetarianModel({
        categoryId: category._id,
        date: moment.utc(menuDate).tz("America/New_York").format(),
        item: itemsOne,
        normalDate: moment
          .utc(menuDate)
          .tz("America/New_York")
          .format("MM-DD-YYYY"),
      });
      await addVegetarianModels.save();
      req.flash("success_msg", "Add Vegetarian Menu Successfully.");
      return res.redirect("/addmenu");
    } else if (category.name === "Supper") {
      const addSupperModels = new supperModel({
        categoryId: category._id,
        date: moment.utc(menuDate).tz("America/New_York").format(),
        item: itemsOne,
        normalDate: moment
          .utc(menuDate)
          .tz("America/New_York")
          .format("MM-DD-YYYY"),
      });
      await addSupperModels.save();
      req.flash("success_msg", "Add Supper Menu Successfully.");
      return res.redirect("/addmenu");
    } else if (category.name === "Box Lunches") {
      const addboxLunchesModels = new boxLunchesModel({
        categoryId: category._id,
        date: moment.utc(menuDate).tz("America/New_York").format(),
        item: itemsOne,
        normalDate: moment
          .utc(menuDate)
          .tz("America/New_York")
          .format("MM-DD-YYYY"),
      });
      await addboxLunchesModels.save();
      req.flash("success_msg", "Add Box Lunches Successfully.");
      return res.redirect("/addmenu");
    } else {
      const amSnackModels = new amSnackModel({
        categoryId: category._id,
        date: moment.utc(menuDate).tz("America/New_York").format(),
        item: itemsOne,
        normalDate: moment
          .utc(menuDate)
          .tz("America/New_York")
          .format("MM-DD-YYYY"),
      });
      await amSnackModels.save();
      req.flash("success_msg", "Add AM Snack Menu Successfully.");
      return res.redirect("/addmenu");
    }
  } catch (error) {
    console.log(error);
    req.flash("error_msg", "Something went wrong");
    res.redirect("/addmenu");
  }
};
