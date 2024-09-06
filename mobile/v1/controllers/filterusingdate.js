const breakfast = require("../../../models/addbreakfast");
const lunchData = require("../../../models/addlunch");
const pmSnaksData = require("../../../models/addpmsnake");
const supperData = require("../../../models/supper");
const vegetarianData = require("../../../models/vegetarian");
const amSnackData = require("../../../models/amSnack");
const boxLunches = require('../../../models/boxLunches')
const Menu =require("../../../models/menu")
const moment = require("moment");
const momentTz = require("moment-timezone");

exports.findusingdate = async (req, res, next) => {
  try {
    const date = req.body.date;
    const weekMenu = req.body.weekMenu;
    const userId = req.user._id;

    console.log("req........", req.body);

    let startDate, endDate;

    // Format the selected date using moment-timezone
    const selectedDate = momentTz.tz(date, "MM-DD-YYYY", "America/New_York");

    if (weekMenu) {
      // Calculate start and end dates of the week
      startDate = selectedDate.clone().startOf("week");
      endDate = selectedDate.clone().endOf("week");

      const americanStartDate = startDate.format("MM-DD-YYYY");
      const americanEndDate = endDate.format("MM-DD-YYYY");

      // Fetch menu data for the week
      const menuDatas = await Menu
        .find({
          date: { $gte: americanStartDate, $lte: americanEndDate },
          userId,
        })
        .populate('categoryId', 'name') // Populate category name
        .sort({ date: 1 })
        .lean();

      // Group data by category (using populated category name)
      const mergedData = menuDatas.reduce((acc, item) => {
        const category = item.categoryId ? item.categoryId.name.toUpperCase().replace(/\s+/g, '')  : "Uncategorized";
        acc[category] = acc[category] || [];
        acc[category].push({ ...item, name: item.categoryId.name });
        return acc;
      }, {});

      // Format dates within mergedData
      Object.values(mergedData).forEach((categoryItems) => {
        categoryItems.forEach((item) => {
          item.date = moment(item.date).format("MM-DD-YYYY");
        });
      });

      return res.send({
        status: 1,
        message: weekMenu ? "Filter Using Week" : "Filter Using Date",
        data: mergedData,
      });
    } else {
      // When weekMenu is not true, fetch data for multiple dates using $in operator

      const americanDates = date.map((d) =>
        momentTz.tz(d, "MM-DD-YYYY", "America/New York").format("MM-DD-YYYY")
      );

      console.log("americanDates......", americanDates);

      const menuDatas = await Menu.find({ date: { $in: americanDates }, userId })
        .populate('categoryId', 'name') // Populate category name
        .sort({ date: 1 })
        .lean();

      // Group data by category (using populated category name)
      const mergedData = menuDatas.reduce((acc, item) => {
        const category = item.categoryId ? item.categoryId.name.toUpperCase().replace(/\s+/g, '')  : "Uncategorized";
        acc[category] = acc[category] || [];
        acc[category].push({ ...item, name: item.categoryId.name });
        return acc;
      }, {});

      // Format dates within mergedData (same as weekMenu case)
      Object.values(mergedData).forEach((categoryItems) => {
        categoryItems.forEach((item) => {
          item.date = moment(item.date).format("MM-DD-YYYY");
        });
      });

      return res.send({
        status: 1,
        message: weekMenu ? "Filter Using Week" : "Filter Using Date",
        data: mergedData,
      });
    }
  } catch (error) {
    console.log("error=>>>", error);
    res.send({ status: 0, message: "Something went wrong" });
  }
};
//mounthly Menu
exports.mounthlyMenu = async (req, res, next) => {
  try {
    const currentMonth = moment().startOf("month");
    const startOfMonth = currentMonth.clone().toDate();
    const endOfMonth = currentMonth.clone().endOf("month").toDate();
    console.log("req........", currentMonth, startOfMonth, endOfMonth);
    const userId = req.user._id;

    // Fetch menu data for the month
    const menuDatas = await Menu.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
      userId,
    })
      .populate('categoryId', 'name') // Populate category name
      .select("-__v") // Exclude the `__v` field
      .lean();

    // Group data by category (using populated category name)
    const mergedData = menuDatas.reduce((acc, item) => {
      const category = item.categoryId ? item.categoryId.name.toUpperCase().replace(/\s+/g, '')  : "Uncategorized";
      acc[category] = acc[category] || [];
      acc[category].push({ ...item, name: item.categoryId.name });
      return acc;
    }, {});

    // Flatten the grouped data (optional)
    const combinedData = Object.values(mergedData).flat();

    res.json({
      status: 1,
      message: "Monthly data",
      data: combinedData,
    });
  } catch (error) {
    console.log("error=>>>", error);
    res.send({ status: 0, message: "Something went wrong" });
  }
};

