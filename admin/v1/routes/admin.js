var express = require("express");
var router = express.Router();
const moment = require("moment");
var generator = require("generate-password");
const bcrypt = require("bcryptjs");
const sendmail2 = require("../../../utils/sendmail2.js");
const mongoose = require("mongoose");
const adminData = require("../../../models/adminmodel.js");
const { authenticateAdmin } = require("../../../middleware/adminauth.js");
const s3image = require("../../../middleware/s3image.js");
const userAdmin = require("../../../middleware/useradmin.js");
const admincontroller = require("../../../admin/v1/controllers/admin");
const categoryControllers = require("../controllers/category");
const breakfastControllers = require("../controllers/breakfast");
const lunchControllers = require("../controllers/lunch");
const pmSnackControllers = require("../controllers/pmsnake");
const uploadImage = require("../../../middleware/s3image");
const localUpload = require("../../../middleware/localfileuploading.js");
const addmenu = require("../controllers/addmenu");
const breakfastModule = require("../../../models/addbreakfast");
const lunchModule = require("../../../models/addlunch");
const pmSnackModel = require("../../../models/addpmsnake");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const termsCondition = require("../../../models/terms_condition.js");
const aboutUsControllers = require("../../../models/aboutus.js");
const contactUsData = require("../../../models/contactUs.js");
const userData = require("../../../models/usermodel.js");
const supperController = require("../../v1/controllers/supper");
const vegetarianController = require("../../v1/controllers/vegetarian");
const supperModel = require("../../../models/supper");
const vegetarianModel = require("../../../models/vegetarian");
const orderModel = require("../../../models/ordermodel");
const userAddressModel = require("../../../models/userAddress.js");
const boxLunchesModel = require("../../../models/boxLunches");
// orders
// breakfast orders
const breakFastOrder = require("../../../models/breakfastOrder.js");
const pmSnackOrder = require("../../../models/pmsnckOrder.js");
const luchOrder = require("../../../models/lunchOrder.js");
const categoryData = require("../../../models/category.js");
const driverModel = require("../../../models/driver");
const welcomeDriver = require("../../../middleware/welcomeNewDriver");
const notificationModel = require("../../../models/notification");
const amSnackData = require("../../../models/amSnack.js");
const sendNotification = require("../../../middleware/sendNotification");
const { createObjectCsvWriter } = require("csv-writer");
const aws = require("aws-sdk");
const path = require("path");
const { s3 } = require("../../../middleware/s3image.js");
const fs = require("fs");
const Menu = require("../../../models/menu");
router.get("/", function (req, res, next) {
	res.render("admin", { title: "admin", message: "" });
});

router.get("/", function (req, res, next) {
	// res.render('index', { title: 'Express' });
	if (req.session.isLoggedin == undefined) {
		console.log("222222222", req.session);

		res.render("admin", { title: "jeffery" });
	} else {
		//console.log("4444444", req.session.isLoggedin);
		res.redirect("/dashboard");
	}
});

router.get("/findAdmin/:id", admincontroller.findAdminData);

router.post(
	"/editAdmin",
	authenticateAdmin,
	s3image.upload.single("image"),
	admincontroller.updateAdminData
);

router.post(
	"/adminChangePass",
	authenticateAdmin,
	admincontroller.updateAdminPassword
);

router.get("/adminprofile", authenticateAdmin, async function (req, res, next) {
	const result = await adminData.find().lean();
	console.log("testtt=>>", result);
	res.render("adminprofile", {
		result: result,
		success: req.flash("success"),
		message: req.flash("error"),
	});
});

// // count for dashboard
router.get("/dashboard", authenticateAdmin, async function (req, res) {
	const userCount = await userData.find().countDocuments();

	const totalBrekfastItems = await breakfastModule.countDocuments();
	const totalLunchItems = await lunchModule.countDocuments();
	const totalPmSnackItems = await pmSnackModel.countDocuments();
	//total item
	const totalItem = totalBrekfastItems + totalLunchItems + totalPmSnackItems;

	const totalOrder = await orderModel.countDocuments();
	const subAdmin = await adminData.countDocuments({ role: "Useradmin" });
	const driver = await driverModel.countDocuments();
	const adminUser = subAdmin + driver;

	res.render("dashboard", {
		title: "dashboard",
		user: adminUser,
		totalOrders: totalOrder,
		clinet: userCount,
		totalItem: totalItem,
	});
});

// // Admin
router.post("/register", admincontroller.singUp);
// router.post('/', admincontroller.login)
//login with passport
router.post("/", async (req, res, next) => {
	// let adminOne = await adminData.findOne({ email: req.body.email })
	// if (adminOne) {
	//   adminOne.deviceToken = req.body.deviceToken ? req.body.deviceToken :adminOne.deviceToken
	//  await adminOne.save();
	// }
	passport.authenticate("local", {
		successRedirect: "/dashboard",
		failureRedirect: "/",
		failureFlash: true,
		successFlash: true,
	})(req, res, next);
});
// router.get('/logout', admincontroller.logout)
//logout
router.get("/logout", (req, res, next) => {
	req.logOut((err) => {
		if (err) {
			console.log(err);
			return next(err);
		}
		req.session.destroy((err) => {
			if (err) {
				console.log(err);
				return next(err);
			}
			res.clearCookie();

			res.redirect("/");
		});
	});
});

router.get("/addcategory", function (req, res, next) {
	res.render("category", { title: "category", message: "" });
});

router.get("/addmenu", authenticateAdmin, async function (req, res, next) {
	const category = await categoryData.find().sort({ name: 1 });
	res.render("addmenu", {
		title: "addmenu",
		message: "",
		// allData: JSON.stringify(allData),
		category: category,
	});
});

router.get("/addcsvmenu", authenticateAdmin, async function (req, res, next) {
	const { userId } = req.query;
	const user = await userData.find();

	let menuQuery = Menu.find();

	if (userId) {
		menuQuery = menuQuery.where("userId").equals(userId);
	}

	const menus = await menuQuery
		.populate("userId", "firstName lastName")
		.populate("categoryId", "name")
		.exec();

	res.render("addcsvmenu", {
		title: "addmenu",
		message: "",
		user: user,
		menus: menus,
	});
});

router.post("/add_category", categoryControllers.add_category);
router.get("/categorylist", categoryControllers.categoryList);
router.get("/category_find/:catId", categoryControllers.editCategory);
router.post("/updateCategory", categoryControllers.updateCategory);

// add breakfast Main add menu
router.post("/addbreakdastdata", breakfastControllers.addBreakfast);
router.post("/addcsvmenu", localUpload.upload.single("csv"), addmenu.AddMenu);

router.get(
	"/termsCondition",
	authenticateAdmin,
	async function (req, res, next) {
		const findData = await termsCondition.findOne().lean();
		res.render("terms_condition", {
			title: "terms_condition",
			record: findData,
		});
		// res.render('terms_condition', { title: 'terms_condition', message: "" });
	}
);

router.post(
	"/terms_Condition/",
	authenticateAdmin,
	async function (req, res, next) {
		try {
			const result = await termsCondition.findByIdAndUpdate(
				req.body.id,
				{ text: req.body.text },
				{ new: true }
			);
			console.log("result=>>>>", result);

			res.redirect("/termsCondition");
		} catch (error) {
			res.redirect("/termsCondition" + error);
		}
	}
);

router.get("/aboutUs", authenticateAdmin, async function (req, res, next) {
	const findData = await aboutUsControllers.findOne().lean();
	res.render("aboutUs", { title: "aboutUs", record: findData });
	// res.render('terms_condition', { title: 'terms_condition', message: "" });
});

router.post("/about_us", authenticateAdmin, async function (req, res, next) {
	try {
		const result = await aboutUsControllers.findByIdAndUpdate(
			req.body.id,
			{ text: req.body.text },
			{ new: true }
		);
		console.log("result=>>>>", result);

		res.redirect("/aboutUs");
	} catch (error) {
		res.redirect("/aboutUs" + error);
	}
});

router.get("/contactUs", authenticateAdmin, async function (req, res, next) {
	const contactUs = await contactUsData.aggregate([
		{
			$lookup: {
				from: "userdatas",
				localField: "userId",
				foreignField: "_id",
				as: "userId",
			},
		},
		{ $unwind: "$userId" },
	]);

	console.log("contactUs=>>>>>>>>>>", contactUs);

	res.render("contactuslist", { title: "contactuslist", contactUs: contactUs });
});

// contact us screen profile
exports.contactUsProfile = async (req, res, next) => {
	try {
	} catch (error) {
		console.log("error=>>>>", error);
	}
};

// userList
router.get("/clientList", authenticateAdmin, async function (req, res, next) {
	try {
		const userList = await userData.find().lean();

		const userListAggre = await userData.aggregate([
			{
				$lookup: {
					from: "useraddressmodels", // The name of the address collection
					localField: "_id",
					foreignField: "userId",
					as: "userAddresses",
				},
			},
			{
				$addFields: {
					defaultAddress: {
						$arrayElemAt: [
							{
								$filter: {
									input: "$userAddresses",
									as: "address",
									cond: { $eq: ["$$address.isDefault", true] },
								},
							},
							0,
						],
					},
				},
			},
			{
				$addFields: {
					userAddresses: {
						$filter: {
							input: "$userAddresses",
							as: "address",
							cond: { $eq: ["$$address.isDefault", true] },
						},
					},
				},
			},
			{
				$project: {
					_id: 1,
					firstName: 1,
					lastName: 1,
					email: 1,
					mobileNumber: 1,
					userImage: 1,
					isAdminApprove: 1,
					defaultAddress: {
						$arrayElemAt: ["$userAddresses", 0],
					},
				},
			},
		]);

		console.log("userListAggr.......", userListAggre);

		res.render("clientList", { title: "Client List", userList: userListAggre });
		// res.send({data:userListAggre})
	} catch (error) {
		console.log("error.........", error);
		res.redirect("/clinetList");
	}
});

router.get("/driversList", authenticateAdmin, async function (req, res, next) {
	try {
		const driver = await driverModel.find().lean();
		console.log("driver...", driver);

		res.render("driversList", { title: "Drivers List", data: driver });
	} catch (error) {
		res.redirect("/driversList");
	}
});

// userProfile
router.get(
	"/userProfile/:id/:addressId?",
	authenticateAdmin,
	async function (req, res, next) {
		try {
			const userId = new mongoose.Types.ObjectId(req.params.id);
			const userProfile = await userData.findOne({
				_id: userId,
			});

			// Fetch user orders status
			const cancelOrder = await orderModel.countDocuments({
				userId: userId,
				orderStatus: "Cancelled",
			});
			const deliveredOrder = await orderModel.countDocuments({
				userId: userId,
				orderStatus: "Delivered",
			});
			const upcomingOrder = await orderModel.countDocuments({
				userId: userId,
				orderStatus: "Upcoming",
			});
			const totalOrders = await orderModel.countDocuments({
				userId: userId,
			});

			let obj = {
				_id: userProfile._id,
				firstName: userProfile.firstName,
				lastName: userProfile.lastName,
				email: userProfile.email,
				mobileNumber: userProfile.mobileNumber,
				userImage: userProfile.userImage,
				totalOrders: totalOrders,
				totalCancelledOrders: cancelOrder,
				totalDelivered: deliveredOrder,
				totalUpcoming: upcomingOrder,
			};

			if (req.params.addressId) {
				const addressId = new mongoose.Types.ObjectId(req.params.addressId);
				const address = await userAddressModel.findById(addressId);
				obj.address = address || {};
			}
			const otheraddresses = await userAddressModel.find({
				userId: req.params.id,
			});
			console.log("other", otheraddresses);
			obj.otheraddresses = otheraddresses;
			res.render("userprofile", {
				title: "User Profile",
				userProfile: obj,
			});
		} catch (error) {
			console.log("error.....", error);
			req.flash("error_msg", "Something went wrong");
			res.redirect("/clientList");
		}
	}
);

//view order page
router.get(
	"/orderviewlist",
	authenticateAdmin,
	async function (req, res, next) {
		const orderId = req.query.orderId;

		const orderDetails = await orderModel
			.findById(orderId)
			.populate({ path: "addressId" })
			.populate({ path: "driverId" });

		console.log("orderDetails.........", orderDetails);

		const userAddress = await userAddressModel.find({
			userId: orderDetails.userId,
		});
		const driver = await driverModel.find({ isAdminApprove: true }).lean();

		res.render("ordersviewlist", {
			title: "ordersviewlist",
			data: orderDetails,
			addressUser: userAddress,
			driver: driver,
		});
	}
);
//
router.post("/edit/updateQuantity", authenticateAdmin, async (req, res) => {
	try {
		const orderId = req.body.orderId;
		console.log("orderId:", orderId);
		const newQuantity = req.body.quantity;
		console.log("newQuantity:", newQuantity);

		const orderFor = req.body.orderFor;
		console.log("orderFor:", orderFor);

		const orderMy = await orderModel.findById(orderId);

		if (orderMy) {
			// const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {

			// })
			let result = await orderModel.findOneAndUpdate(
				{ _id: orderMy._id, "orderItems._id": orderFor },
				{
					$set: {
						"orderItems.$.quantity": newQuantity,
					},
				},
				{ new: true }
			);
			console.log("result.......", result);
			req.flash("success_msg", "Quantity Updated Successfully.");
			res.redirect(`/orderviewlist?orderId=${orderId}`);
		} else {
			res.redirect(`/orderviewlist?orderId=${orderId}`);
		}
	} catch (err) {
		console.log("Error:", err);
		res.status(500).send("Internal Server Error");
	}
});

// add user admin
router.get("/addSubAdmin", authenticateAdmin, function (req, res, next) {
	res.render("addSubAdmin", { title: "Add Sub Admin" });
});

//create sub admin
router.post(
	"/add_useradmin",
	authenticateAdmin,
	async function (req, res, next) {
		try {
			const firstName = req.body.firstName;
			const lastName = req.body.lastName;
			const email = req.body.email;
			const mobile = req.body.mobile;

			const adminFind = await adminData.findOne({ email: email });

			if (adminFind) {
				req.flash("error", "You have already used this email before");
				return res.render("addSubAdmin", { message: req.flash("error") });
			}

			const resetToken = jwt.sign({ email: email }, process.env.TOKEN_KEY);

			const adminUserRegister = new adminData({
				firstName: firstName,
				lastName: lastName,
				email: email,
				mobile: mobile,
				image: `${process.env.BASE_URL}/assets/images/userImage.png`,
				role: "Useradmin",
				resetToken: resetToken,
			});

			let save = await adminUserRegister.save();

			if (save) {
				const resetLink = `${process.env.BASE_URL}/create-new-password?token=${resetToken}`; // Link with token

				await sendmail2(
					save.email,
					"Sub Admin Details",
					userAdmin({
						email: save.email,
						firstName: save.firstName,
						lastName: save.lastName,
						link: resetLink,
					})
				);
				return res.redirect("/adminuserlist");
			}
		} catch (error) {
			console.log("error.....", error);
			req.flash("error_msg", "Something went wrong");
			res.redirect("/addSubAdmin");
		}
	}
);

//reder create new password page
router.get("/create-new-password", async (req, res, next) => {
	try {
		if (req.query.token == undefined) {
			return res.send("Please enter a token or invalid");
		}

		let token = req.query.token;

		let user = await adminData.findOne({ resetToken: token });

		if (!user) return res.send("Invelid Link");

		res.render("newPasswordCreate", { req: req });
	} catch (error) {
		res.status(500).json({ status: 0, message: "Something went wrong" });
	}
});

//sub admin create new password update
router.post("/create-new-password", async (req, res) => {
	try {
		const token = req.body.resetToken;

		console.log("token.......", token);
		const newPassword = req.body.newPassword;
		const decoded = jwt.verify(token, process.env.TOKEN_KEY);
		const email = decoded.email;

		console.log("email.......", email);

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the user's password in the database
		let updatePass = await adminData.updateOne(
			{ email: email },
			{
				password: hashedPassword,
			}
		);

		if (updatePass) {
			// Redirect to login page upon successful password change
			req.flash("success_msg", "Welcome Subadmin.");
			return res.redirect("/");
		} else {
			req.flash("error_msg", "Invalid or expired token");
			return res.redirect(
				`${process.env.BASE_URL}/create-new-password?token=${token}`
			);
		}
	} catch (err) {
		// Handle invalid token or other errors
		console.error(err);
		res.status(400).send("Invalid or expired token");
	}
});

// user adminlist
router.get(
	"/adminuserlist",
	authenticateAdmin,
	async function (req, res, next) {
		try {
			const adminUserList = await adminData.find({ role: "Useradmin" });

			res.render("adminuserlist", {
				title: "adminuserlist",
				adminUserList: adminUserList,
			});
		} catch (error) {
			console.log("error=>>>>>>>>>>>>>>>> ", error);
		}
	}
);

//reports
router.get(
	"/getreportsData",
	authenticateAdmin,
	async function (req, res, next) {
		try {
			const drivers = await driverModel
				.find()
				.select("firstName lastName image");
			const users = await userData.find().select("firstName lastName");
			const categoryList = await categoryData.find().select("name ");
			const addresses = await userAddressModel
				.find()
				.select("locationName userId");
			const userLocations = addresses.reduce((acc, address) => {
				if (!acc[address.userId]) {
					acc[address.userId] = [];
				}
				acc[address.userId].push(address.locationName);
				return acc;
			}, {});
			// res.render("reportslist", {
			//   title: "reportslist",
			//   drivers: drivers,
			//   catlist: categoryList,
			//   users:users,
			//   userLocations: JSON.stringify(userLocations)
			// });
			res.json({
				success: true,
				drivers: drivers,
				users: users,
				categories: categoryList,
				userLocations: userLocations,
			});
		} catch (error) {
			console.error("Error in reportsList route:", error);
			return res.status(500).json({ error: "Internal server error" });
		}
	}
);
router.get("/reportsList", authenticateAdmin, async function (req, res, next) {
	res.render("reportslist");
});
// router.post("/reportsData", authenticateAdmin, async function (req, res, next) {
//   try {
//     const { value, type, driverId, catId: category, userId, startDate, endDate, locationName } = req.body;

//     const today = moment();
//     const drivers = await driverModel.find().select("firstName lastName image");
//     const users = await userData.find().select("firstName lastName");

//     // Convert startDate and endDate to Date objects
//     const start = startDate ? moment(startDate, "YYYY-MM-DD").startOf("day").toDate() : null;
//     const end = endDate ? moment(endDate, "YYYY-MM-DD").endOf("day").toDate() : null;

//     // Construct base filter object
//     let baseFilter = {};
//     if (userId) baseFilter.userId = userId;
//     if (start && end) baseFilter.orderDate = { $gte: start, $lte: end };

//     // Fetch addresses to map location names
//     const addresses = await userAddressModel.find();
//     const locationMap = addresses.reduce((map, address) => {
//       map[address._id] = address.locationName;
//       return map;
//     }, {});

//     if (locationName) {
//       const matchingAddressIds = addresses
//         .filter(address => address.locationName === locationName)
//         .map(address => address._id);
//       baseFilter.addressId = { $in: matchingAddressIds };
//     }

//     // Handle specific value and type
//     const getTimeRangeFilter = (timeUnit) => {
//       switch (timeUnit) {
//         case 'Daily':
//           return { startOf: 'day', endOf: 'day' };
//         case 'Weekly':
//           return { startOf: 'week', endOf: 'week' };
//         case 'Monthly':
//           return { startOf: 'month', endOf: 'month' };
//         default:
//           return {};
//       }
//     };

//     let orders;
//     const timeRangeFilter = value ? getTimeRangeFilter(value) : null;
//     if (timeRangeFilter && timeRangeFilter.startOf) {
//       const startOfPeriod = today.clone().startOf(timeRangeFilter.startOf).toDate();
//       const endOfPeriod = today.clone().endOf(timeRangeFilter.endOf).toDate();
//       baseFilter.orderDate = { $gte: startOfPeriod, $lte: endOfPeriod };
//     }

//     if (type === "mealsdeliver" || type === "totaldelivery" || type === "mealsorder") {
//       if (driverId) baseFilter.driverId = driverId;
//       if (type === "mealsdeliver" || type === "totaldelivery") {
//         baseFilter.orderStatus = "Delivered";
//       } else if (type === "mealsorder") {
//         baseFilter.orderStatus = "Upcoming";
//         if (category) {
//           baseFilter["orderItems.orderType"] = category;
//         }
//       }

//       orders = await orderModel
//         .find(baseFilter)
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       // Initialize mealCategoryCounts
//       const mealCategoryCounts = {
//         "Breakfast": 0,
//         "Lunch": 0,
//         "PM Snack": 0,
//         "Supper": 0,
//         "Vegetarian": 0,
//         "AM Snack": 0
//       };

//       if (start && end) {
//         const dailyOrders = [];
//         const date = new Date(start);

//         while (date <= end) {
//           const dayOrders = orders.filter(order => {
//             const orderDate = new Date(order.orderDate);
//             return orderDate.toDateString() === date.toDateString();
//           }).length;
//           dailyOrders.push(dayOrders);
//           date.setDate(date.getDate() + 1);
//         }

//         // Calculate mealCategoryCounts for the date range
//         orders.forEach(order => {
//           const orderDate = new Date(order.orderDate);
//           if (orderDate >= start && orderDate <= end) {
//             order.orderItems.forEach(item => {
//               if (mealCategoryCounts[item.orderType] !== undefined) {
//                 mealCategoryCounts[item.orderType]++;
//               }
//             });
//           }
//         });

//         console.log("Daily Orders:", dailyOrders); // Log daily orders data for debugging
//         console.log("Meal Category Counts:", mealCategoryCounts); // Log meal category counts for debugging

//         return res.render("reportslist", {
//           title: "reportslist",
//           data: orders,
//           dailyOrders: JSON.stringify(dailyOrders),
//           drivers: drivers,
//           users: users,
//           locations: Array.from(new Set(addresses.map(address => address.locationName))),
//           mealCategoryCounts: type === "mealsorder" ? mealCategoryCounts : {},
//           startDate: startDate,
//           endDate: endDate,
//           value: value,
//           type: type
//         });
//       }

//       // Calculate counts based on time range
//       const counts = value === 'Weekly' ? Array(7).fill(0) :
//         value === 'Monthly' ? Array(12).fill(0) :
//         value === 'Daily' ? Array(24).fill(0) : [];

//       orders.forEach(order => {
//         const date = new Date(order.orderDate);
//         if (value === 'Weekly') counts[date.getDay()]++;
//         else if (value === 'Monthly') counts[date.getMonth()]++;
//         else if (value === 'Daily') counts[date.getHours()]++;

//         if (type === "mealsorder") {
//           order.orderItems.forEach(item => {
//             if (mealCategoryCounts[item.orderType] !== undefined) {
//               mealCategoryCounts[item.orderType]++;
//             }
//           });
//         }
//       });

//       console.log("Counts:", counts); // Log counts data for debugging
//       console.log("Meal Category Counts:", mealCategoryCounts); // Log meal category counts for debugging

//       return res.render("reportslist", {
//         title: "reportslist",
//         data: orders,
//         counts: JSON.stringify(counts),
//         drivers: drivers,
//         users: users,
//         locations: Array.from(new Set(addresses.map(address => address.locationName))),
//         mealCategoryCounts: type === "mealsorder" ? mealCategoryCounts : {},
//         startDate: startDate,
//         endDate: endDate,
//         value: value,
//         type: type
//       });
//     }

//     // Handle date range filter only
//     orders = await orderModel
//       .find(baseFilter)
//       .populate({ path: "userId" })
//       .populate({ path: "addressId" })
//       .sort({ created_at: -1 });

//     const dailyOrders = value === 'Daily' ? Array(24).fill(0) : [];
//     if (value === 'Daily') {
//       orders.forEach(order => {
//         const date = new Date(order.orderDate);
//         dailyOrders[date.getHours()]++;
//       });
//     } else if (start && end) {
//       const date = new Date(start);
//       while (date <= end) {
//         const dayOrders = orders.filter(order => {
//           const orderDate = new Date(order.orderDate);
//           return orderDate.toDateString() === date.toDateString();
//         }).length;
//         dailyOrders.push(dayOrders);
//         date.setDate(date.getDate() + 1);
//       }
//     }

//     console.log("Daily Orders:", dailyOrders); // Log daily orders data for debugging

//     return res.render("reportslist", {
//       title: "reportslist",
//       data: orders,
//       dailyOrders: JSON.stringify(dailyOrders),
//       drivers: drivers,
//       users: users,
//       locations: Array.from(new Set(addresses.map(address => address.locationName))),
//       mealCategoryCounts: {},
//       startDate: startDate,
//       endDate: endDate,
//       value: value,
//       type: type
//     });
//   } catch (error) {
//     console.error("Error in reportsData route:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

router.post("/reportsData", authenticateAdmin, async function (req, res, next) {
	try {
		const {
			value,
			type,
			driverId,
			catId: category,
			userId,
			startDate,
			endDate,
			locationName,
		} = req.body;

		const today = moment();
		const drivers = await driverModel.find().select("firstName lastName image");
		const users = await userData.find().select("firstName lastName");

		// Convert startDate and endDate to Date objects
		const start = startDate
			? moment(startDate, "YYYY-MM-DD").startOf("day").toDate()
			: null;
		const end = endDate
			? moment(endDate, "YYYY-MM-DD").endOf("day").toDate()
			: null;

		// Construct base filter object
		let baseFilter = {};
		if (userId) baseFilter.userId = userId;
		if (start && end) baseFilter.orderDate = { $gte: start, $lte: end };

		// Fetch addresses to map location names
		const addresses = await userAddressModel.find();
		const locationMap = addresses.reduce((map, address) => {
			map[address._id] = address.locationName;
			return map;
		}, {});

		// Handle filtering by multiple location names
		if (locationName && locationName.length > 0) {
			const matchingAddressIds = addresses
				.filter((address) => locationName.includes(address.locationName))
				.map((address) => address._id);
			baseFilter.addressId = { $in: matchingAddressIds };
		}

		// Handle specific value and type
		const getTimeRangeFilter = (timeUnit) => {
			switch (timeUnit) {
				case "Daily":
					return { startOf: "day", endOf: "day" };
				case "Weekly":
					return { startOf: "week", endOf: "week" };
				case "Monthly":
					return { startOf: "month", endOf: "month" };
				default:
					return {};
			}
		};

		let orders;
		const timeRangeFilter = value ? getTimeRangeFilter(value) : null;
		if (timeRangeFilter && timeRangeFilter.startOf) {
			const startOfPeriod = today
				.clone()
				.startOf(timeRangeFilter.startOf)
				.toDate();
			const endOfPeriod = today.clone().endOf(timeRangeFilter.endOf).toDate();
			baseFilter.orderDate = { $gte: startOfPeriod, $lte: endOfPeriod };
		}

		if (
			type === "mealsdeliver" ||
			type === "totaldelivery" ||
			type === "mealsorder"
		) {
			if (driverId) baseFilter.driverId = driverId;
			if (type === "mealsdeliver" || type === "totaldelivery") {
				baseFilter.orderStatus = "Delivered";
			} else if (type === "mealsorder") {
				baseFilter.orderStatus = "Upcoming";
				if (category) {
					baseFilter["orderItems.orderType"] = category;
				}
			}

			orders = await orderModel
				.find(baseFilter)
				.populate({ path: "userId" })
				.populate({ path: "addressId" })
				.sort({ created_at: -1 });

			// Initialize mealCategoryCounts
			const mealCategoryCounts = {
				Breakfast: 0,
				Lunch: 0,
				"PM Snack": 0,
				Supper: 0,
				Vegetarian: 0,
				"AM Snack": 0,
			};

			if (start && end) {
				const dailyOrders = [];
				const date = new Date(start);

				while (date <= end) {
					const dayOrders = orders.filter((order) => {
						const orderDate = new Date(order.orderDate);
						return orderDate.toDateString() === date.toDateString();
					}).length;
					dailyOrders.push(dayOrders);
					date.setDate(date.getDate() + 1);
				}

				// Calculate mealCategoryCounts for the date range
				orders.forEach((order) => {
					const orderDate = new Date(order.orderDate);
					if (orderDate >= start && orderDate <= end) {
						order.orderItems.forEach((item) => {
							if (mealCategoryCounts[item.orderType] !== undefined) {
								mealCategoryCounts[item.orderType]++;
							}
						});
					}
				});

				console.log("Daily Orders:", dailyOrders); // Log daily orders data for debugging
				console.log("Meal Category Counts:", mealCategoryCounts); // Log meal category counts for debugging

				return res.render("reportslist", {
					title: "reportslist",
					data: orders,
					dailyOrders: JSON.stringify(dailyOrders),
					drivers: drivers,
					users: users,
					locations: Array.from(
						new Set(addresses.map((address) => address.locationName))
					),
					mealCategoryCounts: type === "mealsorder" ? mealCategoryCounts : {},
					startDate: startDate,
					endDate: endDate,
					value: value,
					type: type,
				});
			}

			// Calculate counts based on time range
			const counts =
				value === "Weekly"
					? Array(7).fill(0)
					: value === "Monthly"
					? Array(12).fill(0)
					: value === "Daily"
					? Array(24).fill(0)
					: [];

			orders.forEach((order) => {
				const date = new Date(order.orderDate);
				if (value === "Weekly") counts[date.getDay()]++;
				else if (value === "Monthly") counts[date.getMonth()]++;
				else if (value === "Daily") counts[date.getHours()]++;

				if (type === "mealsorder") {
					order.orderItems.forEach((item) => {
						if (mealCategoryCounts[item.orderType] !== undefined) {
							mealCategoryCounts[item.orderType]++;
						}
					});
				}
			});

			console.log("Counts:", counts); // Log counts data for debugging
			console.log("Meal Category Counts:", mealCategoryCounts); // Log meal category counts for debugging

			return res.render("reportslist", {
				title: "reportslist",
				data: orders,
				counts: JSON.stringify(counts),
				drivers: drivers,
				users: users,
				locations: Array.from(
					new Set(addresses.map((address) => address.locationName))
				),
				mealCategoryCounts: type === "mealsorder" ? mealCategoryCounts : {},
				startDate: startDate,
				endDate: endDate,
				value: value,
				type: type,
			});
		}

		// Handle date range filter only
		orders = await orderModel
			.find(baseFilter)
			.populate({ path: "userId" })
			.populate({ path: "addressId" })
			.sort({ created_at: -1 });

		const dailyOrders = value === "Daily" ? Array(24).fill(0) : [];
		if (value === "Daily") {
			orders.forEach((order) => {
				const date = new Date(order.orderDate);
				dailyOrders[date.getHours()]++;
			});
		} else if (start && end) {
			const date = new Date(start);
			while (date <= end) {
				const dayOrders = orders.filter((order) => {
					const orderDate = new Date(order.orderDate);
					return orderDate.toDateString() === date.toDateString();
				}).length;
				dailyOrders.push(dayOrders);
				date.setDate(date.getDate() + 1);
			}
		}

		console.log("Daily Orders:", dailyOrders);

		return res.render("reportslist", {
			title: "reportslist",
			data: orders,
			dailyOrders: JSON.stringify(dailyOrders),
			drivers: drivers,
			users: users,
			locations: Array.from(
				new Set(addresses.map((address) => address.locationName))
			),
			mealCategoryCounts: {},
			startDate: startDate,
			endDate: endDate,
			value: value,
			type: type,
		});
	} catch (error) {
		console.error("Error in reportsData route:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
});

// CSV Work
router.post("/reportsData-CSV", async function (req, res, next) {
	try {
		const { locationNames } = req.body;

		// Validate locationNames
		if (
			!locationNames ||
			!Array.isArray(locationNames) ||
			locationNames.length === 0
		) {
			return res.status(400).json({
				status: 0,
				message: "locationNames should be a non-empty array",
			});
		}

		// Find orders based on multiple locationNames
		const orders = await orderModel.find({
			locationName: { $in: locationNames },
		});

		if (orders.length === 0) {
			return res.status(404).json({
				status: 0,
				message: "No orders found for the specified locations",
			});
		}

		// Generate a unique file name for the CSV
		const fileName = `reportsData-${Date.now()}.csv`;

		// CSV Writer Configuration (save locally before uploading)
		const csvWriter = createObjectCsvWriter({
			path: path.join(__dirname, fileName),
			header: [
				{ id: "locationName", title: "Site Name" },
				{ id: "createdAt", title: "Date" },
				{ id: "mealType", title: "Meal Type" },
				{ id: "count", title: "Count" },
			],
		});

		// Map the order items to CSV records
		const records = [];

		// Iterate over each order and extract required data
		orders.forEach((order) => {
			order.orderItems.forEach((item) => {
				records.push({
					locationName: order.locationName,
					createdAt: moment(order.created_at).format("ddd, MM-DD-YY"),
					mealType: item.orderType,
					count: item.quantity,
				});
			});
		});

		// Write records to CSV
		await csvWriter.writeRecords(records);

		// Read the generated CSV file
		const fileContent = fs.readFileSync(path.join(__dirname, fileName));

		// Upload the file to S3
		const params = {
			Bucket: "jefferys-s3", // Replace with your bucket name
			Key: fileName, // File name in S3
			Body: fileContent,
			ContentType: "text/csv",
			ACL: "public-read", // You can adjust the ACL as needed
		};

		s3.upload(params, function (err, data) {
			if (err) {
				console.error("Error uploading file:", err);
				return res.status(500).json({
					status: 0,
					message: "Failed to upload CSV to S3",
				});
			}

			// Success, send the S3 file URL
			res.status(200).json({
				status: 1,
				message: "Report generated and uploaded successfully",
				data: data.Location, // This is the S3 URL of the uploaded file
			});

			// Optionally, delete the local file after upload
			fs.unlinkSync(path.join(__dirname, fileName));
		});
	} catch (error) {
		console.error("Request Body:", req.body);
		console.error("Error", error);
		return res.status(500).json({
			status: 0,
			error: "Internal server error",
		});
	}
});

router.post("/reportsData-CSV-2", async function (req, res, next) {
	try {
		const {
			value,
			driverId,
			catId: category,
			userId,
			startDate,
			endDate,
			locationName,
		} = req.body;

		// Validate userId format
		if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: "Invalid userId format" });
		}

		const addresses = await userAddressModel.find();
		const orders = await orderModel.find();

		// Create a mapping of location names for easy lookup
		const addressMap = {};
		addresses.forEach((address) => {
			addressMap[address.locationName] = address;
		});

		// CSV Writer Configuration
		const csvWriter = createObjectCsvWriter({
			path: "CSV/reportsData.csv",
			header: [
				{ id: "locationName", title: "Site Name" },
				{ id: "createdAt", title: "Date" },
				{ id: "mealType", title: "Meal Type" },
				{ id: "count", title: "Count" },
			],
		});

		// Map the order items to CSV records
		const records = [];

		// Iterate over each order
		orders.forEach((order) => {
			order.orderItems.forEach((item) => {
				const locationData = addressMap[order.locationName];
				if (locationData) {
					records.push({
						locationName: locationData.locationName,
						createdAt: moment(order.created_at).format("ddd, DD-MM-YY"),
						mealType: item.orderType,
						count: item.quantity,
					});
				}
			});
		});

		// Write records to CSV
		await csvWriter.writeRecords(records);

		return res.status(200).json({
			status: 1,
			message: "Report generated successfully",
			data: records,
		});
	} catch (error) {
		console.error("Request Body:", req.body);
		console.error("Error", error);
		return res.status(500).json({
			status: 0,
			error: "Internal server error",
		});
	}
});

//Akif work manu view
router.get("/getList", authenticateAdmin, async (req, res, next) => {
	try {
		let indexOfList = req.query.value;
		let month = req.query.month;
		console.log("value.....", indexOfList);

		let matchStage = {};
		if (month) {
			matchStage = {
				$match: {
					$expr: {
						$eq: [{ $month: "$date" }, parseInt(month)],
					},
				},
			};
		}

		let aggregationPipeline = [
			{
				$lookup: {
					from: "categorydatas",
					localField: "categoryId",
					foreignField: "_id",
					as: "categoryId",
				},
			},
			{ $unwind: "$categoryId" },
			{
				$sort: {
					date: -1,
				},
			},
		];

		// Add matchStage to the pipeline if it's not empty
		if (Object.keys(matchStage).length !== 0) {
			aggregationPipeline.push(matchStage);
		}

		let data = [];
		switch (indexOfList) {
			case "1":
				data = await breakfastModule.aggregate(aggregationPipeline);
				break;
			case "2":
				data = await amSnackData.aggregate(aggregationPipeline);
				break;
			case "3":
				data = await lunchModule.aggregate(aggregationPipeline);
				break;
			case "4":
				data = await boxLunchesModel.aggregate(aggregationPipeline);
				break;
			case "5":
				data = await pmSnackModel.aggregate(aggregationPipeline);
				break;
			case "6":
				data = await supperModel.aggregate(aggregationPipeline);
				break;
			default:
				data = await vegetarianModel.aggregate(aggregationPipeline);
				break;
		}

		let formattedData = [];
		if (data.length > 0) {
			formattedData = data.map((item) => {
				let obj = {
					_id: item._id,
					date: item.date,
					categoryName: item.categoryId.name,
					categoryId: item.categoryId._id,
					item: item.item,
				};
				const itemIds = item.item.map((subItem) => subItem._id);
				obj.stringifiedIds = JSON.stringify(itemIds);
				return obj;
			});
		}

		return res.render("itemsList", {
			title: "All items lists",
			data: formattedData,
			tabNumber: indexOfList,
		});
	} catch (error) {
		console.log(error);
		req.flash("error_msg", "Something went wrong.");
	}
});

//client info edit
router.get("/clientEdit/:id", authenticateAdmin, async (req, res, next) => {
	try {
		const clientId = req.params.id;
		const clients = await userData.findById(clientId);
		console.log("clientId.....", clients);
		if (!clients) {
			res.redirect("/userList");
		} else {
			res.render("editClients", { title: "Clients Edit", data: clients });
		}
	} catch (error) {
		console.log("error.......", error);
		res.redirect("/userList");
	}
});

//update client information
router.post(
	"/updateClientInfo",
	authenticateAdmin,
	s3image.upload.single("userImage"),
	async (req, res, next) => {
		try {
			const { firstName, lastName, email, mobileNumber, id } = req.body;

			const clients = await userData.findById(id);
			console.log("clientId.....", clients);
			if (!clients) {
				res.redirect(`/clientEdit${req.body.id}`);
			} else {
				let image;
				if (req.file) {
					clients.userImage = req.file.location
						? req.file.location
						: req.file.path;
				}
				clients.firstName = firstName;
				clients.lastName = lastName;
				clients.email = email;
				clients.mobileNumber = mobileNumber;

				await clients.save();

				res.redirect("/clientList");
			}
		} catch (error) {
			console.log("error.......", error);
			res.redirect(`/clientEdit${req.body.id}`);
		}
	}
);

//client delete
router.post("/clientDelete", authenticateAdmin, async (req, res, next) => {
	try {
		let id = req.body.id;
		const clients = await userData.findByIdAndRemove(id);
		if (clients) {
			res.redirect("/clientList");
		}
	} catch (error) {
		console.log("error.......", error);
		res.redirect("/clientList");
	}
});

router.post("/addressDelete", authenticateAdmin, async (req, res, next) => {
	try {
		let id = req.body.id;
		const address = await userAddressModel.findByIdAndRemove(id);
		if (address) {
			res.redirect("/clientList");
		}
	} catch (error) {
		console.log("error.......", error);
		res.redirect("/clientList");
	}
});

//render page on update menu
router.get("/updateitem", authenticateAdmin, async (req, res) => {
	try {
		const itemId = req.query.itemId;
		const iId = JSON.parse(req.query.itemid);
		const categoryName = req.query.categoryName;

		let result;

		console.log("itemId....", itemId, categoryName, iId);

		if (categoryName === "Breakfast") {
			result = await breakfastModule.findById(
				itemId
				//'item._id': iId // Match the specific item by its _id within the item array
			);
		} else if (categoryName === "PM Snacks") {
			result = await pmSnackModel.findById(
				itemId
				//'item._id': iId // Match the specific item by its _id within the item array
			);
		} else if (categoryName === "Lunch") {
			result = await lunchModule.findById(
				itemId
				//'item._id': iId // Match the specific item by its _id within the item array
			);
		} else if (categoryName === "Box Lunches") {
			result = await boxLunchesModel.findById(
				itemId
				//'item._id': iId // Match the specific item by its _id within the item array
			);
		} else if (categoryName === "Vegetarian") {
			result = await vegetarianModel.findById(
				itemId
				//'item._id': iId // Match the specific item by its _id within the item array
			);
		} else if (categoryName === "AM Snack") {
			result = await amSnackData.findById(
				itemId
				//'item._id': iId // Match the specific item by its _id within the item array
			);
		} else {
			result = await supperModel.findById(
				itemId
				//'item._id': iId // Match the specific item by its _id within the item array
			);
		}
		console.log("result.......", result);

		const categoryFind = await categoryData.findOne({ _id: result.categoryId });

		const openedResult = result.item.map((it1) => ({
			_id: result._id, // Add the original _id to each opened result item
			name: it1.items,
			id: it1._id, // Assuming description exists in the 'item' object
		}));

		const category = await categoryData.find().lean();

		res.render("editItems", {
			data: openedResult.flat(),
			result: result,
			categoryName: categoryFind.name,
			categoryId: categoryFind._id,
			category: category,
		}); // Pass the opened result data to the view
	} catch (error) {
		console.log("Error:", error);
		// res.status(500).send('Internal Server Error')
	}
});

//edit menu itme
router.post("/editsItem", authenticateAdmin, async (req, res) => {
	try {
		const itemIds = req.body.itemId;
		const iIds = req.body.itemid;
		const newItems = Array.isArray(req.body.item)
			? req.body.item
			: [req.body.item];
		const categoryNames = req.body.categoryName;
		const categoryId = req.body.categoryId;

		console.log("newItems......", newItems);

		if (categoryNames === "Breakfast" && iIds.length === newItems.length) {
			const breakFast = await breakfastModule.findById(itemIds);
			if (categoryId) {
				const newCategory = await categoryData.findById(categoryId);
				switch (newCategory.name) {
					case "Breakfast":
						newModel = breakfastModule;
						break;
					case "Lunch":
						newModel = lunchModule;
						break;
					case "PM Snacks":
						newModel = pmSnackModel;
						break;
					case "Vegetarian":
						newModel = vegetarianModel;
						break;
					case "AM Snack":
						newModel = amSnackData;
						break;
					case "Box Lunches":
						newModel = boxLunchesModel;
						break;
					default:
						newModel = supperModel;
				}

				console.log("newModel.....", newModel);
				const newMenu = new newModel({
					categoryId: categoryId,
					date: breakFast.date,
					item: newItems
						? newItems.map((item) => {
								return { items: item };
						  })
						: breakFast.item,
					normalDate: breakFast.normalDate,
				});
				let save = await newMenu.save();

				if (save) {
					// To
					const breakFastDeleteResult = await breakfastModule.deleteOne({
						_id: itemIds,
					});

					// Check if the delete operation was successful before proceeding
					if (breakFastDeleteResult.deletedCount === 1) {
						req.flash("success_msg", "Updated category and Menu Successfully.");
						return res.redirect("/getList?value=1");
					} else {
						// Handle the case where the delete operation failed
						console.error("Delete operation failed.");
						// You might want to handle this case based on your application's logic
						req.flash("error_msg", "Something went wrong.");
					}
				}

				req.flash("success_msg", "Updated category and Menu Successfully.");
				return res.redirect("/getList?value=1");
			} else {
				const updatePromises = iIds.map(async (iId, index) => {
					await breakfastModule.updateOne(
						{ _id: itemIds, "item._id": iId },
						{
							$set: { "item.$.items": newItems[index], categoryId: categoryId },
						},
						{ new: true }
					);
				});

				await Promise.all(updatePromises);
				req.flash("success_msg", "Updated Breakfast Menu Successfully.");
				return res.redirect("/getList?value=1");
			}
		} else if (categoryNames === "Lunch" && iIds.length === newItems.length) {
			const lunch = await lunchModule.findById(itemIds);

			if (categoryId) {
				const newCategory = await categoryData.findById(categoryId);
				switch (newCategory.name) {
					case "Breakfast":
						newModel = breakfastModule;
						break;
					case "Lunch":
						newModel = lunchModule;
						break;
					case "PM Snacks":
						newModel = pmSnackModel;
						break;
					case "Vegetarian":
						newModel = vegetarianModel;
						break;
					case "AM Snack":
						newModel = amSnackData;
						break;
					case "Box Lunches":
						newModel = boxLunchesModel;
						break;
					default:
						newModel = supperModel;
				}

				console.log("newModel.....", newModel);
				const newMenu = new newModel({
					categoryId: categoryId,
					date: lunch.date,
					item: newItems
						? newItems.map((item) => {
								return { items: item };
						  })
						: lunch.item,
					normalDate: lunch.normalDate,
				});
				let save = await newMenu.save();

				if (save) {
					// To
					const lunchDeleteResult = await lunchModule.deleteOne({
						_id: itemIds,
					});

					// Check if the delete operation was successful before proceeding
					if (lunchDeleteResult.deletedCount === 1) {
						req.flash("success_msg", "Updated category and Menu Successfully.");
						return res.redirect("/getList?value=3");
					} else {
						// Handle the case where the delete operation failed
						console.error("Delete operation failed.");
						// You might want to handle this case based on your application's logic
						req.flash("error_msg", "Something went wrong.");
					}
				}

				req.flash(
					"success_msg",
					"Updated category and Lunch Menu Successfully."
				);
				return res.redirect("/getList?value=3");
			} else {
				const updatePromises = iIds.map(async (iId, index) => {
					await lunchModule.updateOne(
						{ _id: itemIds, "item._id": iId },
						{
							$set: { "item.$.items": newItems[index], categoryId: categoryId },
						},
						{ new: true }
					);
				});

				await Promise.all(updatePromises);
				req.flash("success_msg", "Updated Lunch Menu Successfully.");
				return res.redirect("/getList?value=3");
			}
		} else if (
			categoryNames === "PM Snacks" &&
			iIds.length === newItems.length
		) {
			const pmSnack = await pmSnackModel.findById(itemIds);

			if (categoryId) {
				const newCategory = await categoryData.findById(categoryId);
				switch (newCategory.name) {
					case "Breakfast":
						newModel = breakfastModule;
						break;
					case "Lunch":
						newModel = lunchModule;
						break;
					case "PM Snacks":
						newModel = pmSnackModel;
						break;
					case "Vegetarian":
						newModel = vegetarianModel;
						break;
					case "AM Snack":
						newModel = amSnackData;
						break;
					case "Box Lunches":
						newModel = boxLunchesModel;
						break;
					default:
						newModel = supperModel;
				}

				console.log("newModel.....", newModel);
				const newMenu = new newModel({
					categoryId: categoryId,
					date: pmSnack.date,
					item: newItems
						? newItems.map((item) => {
								return { items: item };
						  })
						: pmSnack.item,
					normalDate: pmSnack.normalDate,
				});
				let save = await newMenu.save();

				if (save) {
					// To
					const pmSnackDeleteResult = await pmSnackModel.deleteOne({
						_id: itemIds,
					});

					// Check if the delete operation was successful before proceeding
					if (pmSnackDeleteResult.deletedCount === 1) {
						req.flash(
							"success_msg",
							"Updated category and PM Snacks Menu Successfully."
						);
						return res.redirect("/getList?value=5");
					} else {
						// Handle the case where the delete operation failed
						console.error("Delete operation failed.");
						// You might want to handle this case based on your application's logic
						req.flash("error_msg", "Something went wrong.");
					}
				}

				req.flash(
					"success_msg",
					"Updated category and PM Snacks Menu Successfully."
				);
				return res.redirect("/getList?value=5");
			} else {
				const updatePromises = iIds.map(async (iId, index) => {
					await pmSnackModel.updateOne(
						{ _id: itemIds, "item._id": iId },
						{
							$set: { "item.$.items": newItems[index], categoryId: categoryId },
						},
						{ new: true }
					);
				});

				await Promise.all(updatePromises);
				req.flash("success_msg", "Updated PM Snacks Menu Successfully.");
				return res.redirect("/getList?value=5");
			}
		} else if (
			categoryNames === "Vegetarian" &&
			iIds.length === newItems.length
		) {
			const vegetarian = await vegetarianModel.findById(itemIds);

			if (categoryId) {
				const newCategory = await categoryData.findById(categoryId);
				switch (newCategory.name) {
					case "Breakfast":
						newModel = breakfastModule;
						break;
					case "Lunch":
						newModel = lunchModule;
						break;
					case "PM Snacks":
						newModel = pmSnackModel;
						break;
					case "Vegetarian":
						newModel = vegetarianModel;
						break;
					case "AM Snack":
						newModel = amSnackData;
						break;
					case "Box Lunches":
						newModel = boxLunchesModel;
						break;
					default:
						newModel = supperModel;
				}

				console.log("newModel.....", newModel);
				const newMenu = new newModel({
					categoryId: categoryId,
					date: vegetarian.date,
					item: newItems
						? newItems.map((item) => {
								return { items: item };
						  })
						: vegetarian.item,
					normalDate: vegetarian.normalDate,
				});
				let save = await newMenu.save();

				if (save) {
					// To
					const vegetarianDeleteResult = await vegetarianModel.deleteOne({
						_id: itemIds,
					});

					// Check if the delete operation was successful before proceeding
					if (vegetarianDeleteResult.deletedCount === 1) {
						req.flash(
							"success_msg",
							"Updated category and vegetarian Menu Successfully."
						);
						return res.redirect("/getList?value=7");
					} else {
						// Handle the case where the delete operation failed
						console.error("Delete operation failed.");
						// You might want to handle this case based on your application's logic
						req.flash("error_msg", "Something went wrong.");
					}
				}

				req.flash(
					"success_msg",
					"Updated category and vegetarian Menu Successfully."
				);
				return res.redirect("/getList?value=7");
			} else {
				const updatePromises = iIds.map(async (iId, index) => {
					await vegetarianModel.updateOne(
						{ _id: itemIds, "item._id": iId },
						{
							$set: { "item.$.items": newItems[index], categoryId: categoryId },
						},
						{ new: true }
					);
				});

				await Promise.all(updatePromises);
				req.flash("success_msg", "Updated vegetarian Menu Successfully.");
				return res.redirect("/getList?value=7");
			}
		} else if (
			categoryNames === "AM Snack" &&
			iIds.length === newItems.length
		) {
			const AMSnack = await amSnackData.findById(itemIds);

			if (categoryId) {
				const newCategory = await categoryData.findById(categoryId);
				switch (newCategory.name) {
					case "Breakfast":
						newModel = breakfastModule;
						break;
					case "Lunch":
						newModel = lunchModule;
						break;
					case "PM Snacks":
						newModel = pmSnackModel;
						break;
					case "Vegetarian":
						newModel = vegetarianModel;
						break;
					case "AM Snack":
						newModel = amSnackData;
						break;
					case "Box Lunches":
						newModel = boxLunchesModel;
						break;
					default:
						newModel = supperModel;
				}

				console.log("newModel.....", newModel);
				const newMenu = new newModel({
					categoryId: categoryId,
					date: AMSnack.date,
					item: newItems
						? newItems.map((item) => {
								return { items: item };
						  })
						: AMSnack.item,
					normalDate: AMSnack.normalDate,
				});
				let save = await newMenu.save();

				if (save) {
					// To
					const vegetarianDeleteResult = await amSnackData.deleteOne({
						_id: itemIds,
					});

					// Check if the delete operation was successful before proceeding
					if (vegetarianDeleteResult.deletedCount === 1) {
						req.flash(
							"success_msg",
							"Updated category and AM Snack Menu Successfully."
						);
						return res.redirect("/getList?value=2");
					} else {
						// Handle the case where the delete operation failed
						console.error("Delete operation failed.");
						// You might want to handle this case based on your application's logic
						req.flash("error_msg", "Something went wrong.");
					}
				}

				req.flash(
					"success_msg",
					"Updated category and AM Snack Menu Successfully."
				);
				return res.redirect("/getList?value=2");
			} else {
				const updatePromises = iIds.map(async (iId, index) => {
					await amSnackData.updateOne(
						{ _id: itemIds, "item._id": iId },
						{
							$set: { "item.$.items": newItems[index], categoryId: categoryId },
						},
						{ new: true }
					);
				});

				await Promise.all(updatePromises);
				req.flash("success_msg", "Updated AM Snack Menu Successfully.");
				return res.redirect("/getList?value=2");
			}
		} else if (
			categoryNames === "Box Lunches" &&
			iIds.length === newItems.length
		) {
			const boxLunches = await boxLunchesModel.findById(itemIds);

			if (categoryId) {
				const newCategory = await categoryData.findById(categoryId);
				switch (newCategory.name) {
					case "Breakfast":
						newModel = breakfastModule;
						break;
					case "Lunch":
						newModel = lunchModule;
						break;
					case "PM Snacks":
						newModel = pmSnackModel;
						break;
					case "Vegetarian":
						newModel = vegetarianModel;
						break;
					case "AM Snack":
						newModel = amSnackData;
						break;
					case "Box Lunches":
						newModel = boxLunchesModel;
						break;
					default:
						newModel = supperModel;
				}

				console.log("newModel.....", newModel);
				const newMenu = new newModel({
					categoryId: categoryId,
					date: boxLunches.date,
					item: newItems
						? newItems.map((item) => {
								return { items: item };
						  })
						: AMSnack.item,
					normalDate: boxLunches.normalDate,
				});
				let save = await newMenu.save();

				if (save) {
					// To
					const vegetarianDeleteResult = await boxLunchesModel.deleteOne({
						_id: itemIds,
					});

					// Check if the delete operation was successful before proceeding
					if (vegetarianDeleteResult.deletedCount === 1) {
						req.flash(
							"success_msg",
							"Updated category and Box lunches Menu Successfully."
						);
						return res.redirect("/getList?value=4");
					} else {
						// Handle the case where the delete operation failed
						console.error("Delete operation failed.");
						// You might want to handle this case based on your application's logic
						req.flash("error_msg", "Something went wrong.");
					}
				}

				req.flash(
					"success_msg",
					"Updated category and Box lunches Menu Successfully."
				);
				return res.redirect("/getList?value=4");
			} else {
				const updatePromises = iIds.map(async (iId, index) => {
					await amSnackData.updateOne(
						{ _id: itemIds, "item._id": iId },
						{
							$set: { "item.$.items": newItems[index], categoryId: categoryId },
						},
						{ new: true }
					);
				});

				await Promise.all(updatePromises);
				req.flash("success_msg", "Updated Box lunches Menu Successfully.");
				return res.redirect("/getList?value=4");
			}
		} else {
			const Supper = await supperModel.findById(itemIds);

			if (categoryId) {
				const newCategory = await categoryData.findById(categoryId);
				switch (newCategory.name) {
					case "Breakfast":
						newModel = breakfastModule;
						break;
					case "Lunch":
						newModel = lunchModule;
						break;
					case "PM Snacks":
						newModel = pmSnackModel;
						break;
					case "Vegetarian":
						newModel = vegetarianModel;
						break;
					case "AM Snack":
						newModel = amSnackData;
						break;
					case "Box Lunches":
						newModel = boxLunchesModel;
						break;
					default:
						newModel = supperModel;
				}

				console.log("newModel.....", newModel);
				const newMenu = new newModel({
					categoryId: categoryId,
					date: Supper.date,
					item: newItems
						? newItems.map((item) => {
								return { items: item };
						  })
						: Supper.item,
					normalDate: Supper.normalDate,
				});
				let save = await newMenu.save();

				if (save) {
					// To
					const supperDeleteResult = await supperModel.deleteOne({
						_id: itemIds,
					});

					// Check if the delete operation was successful before proceeding
					if (supperDeleteResult.deletedCount === 1) {
						req.flash(
							"success_msg",
							"Updated category and Supper Menu Successfully."
						);
						return res.redirect("/getList?value=6");
					} else {
						// Handle the case where the delete operation failed
						console.error("Delete operation failed.");
						// You might want to handle this case based on your application's logic
						req.flash("error_msg", "Something went wrong.");
					}
				}

				req.flash(
					"success_msg",
					"Updated category and Supper Menu Successfully."
				);
				return res.redirect("/getList?value=6");
			} else {
				const updatePromises = iIds.map(async (iId, index) => {
					await supperModel.updateOne(
						{ _id: itemIds, "item._id": iId },
						{
							$set: { "item.$.items": newItems[index], categoryId: categoryId },
						},
						{ new: true }
					);
				});

				await Promise.all(updatePromises);
				req.flash("success_msg", "Updated Supper Menu Successfully.");
				return res.redirect("/getList?value=6");
			}
		}
	} catch (error) {
		console.log("Error:", error);
		req.flash("error_msg", "Something went wrong.");
		// return res.status(500).json({ error: 'Server error' })
	}
});

//change AKIf Order List
// router.get("/reportList", authenticateAdmin, async function (req, res, next) {
//   try {
//     const value = req.query.value;
//     var today = moment();
//     if(value==="All"){
//       const order = await orderModel.find()
//       .populate({ path: "userId" })
//       .populate({ path: "addressId" })
//       .sort({ created_at: -1 });
//       res.render("Sortingorders", {
//         title: "Order List",
//         data: order,
//       });
//     }else if (value === "Monthly") {
//       const startOfMonth = today.clone().startOf("month").format("MM-DD-YYYY"); // Start of the current week (Sunday)
//       const endOfMonth = today.clone().endOf("month").format("MM-DD-YYYY");

//       console.log(startOfMonth, endOfMonth);

//       const order = await orderModel
//         .find({ orderDate: { $gte: startOfMonth, $lte: endOfMonth } })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       res.render("Sortingorders", {
//         title: "Order List",
//         data: order,
//       });
//     } else if (value === "nextMonth") {
//       // Calculate start and end dates for the next month
//       const startOfNextMonth = today
//         .clone()
//         .add(1, "month")
//         .startOf("month")
//         .format("MM-DD-YYYY");
//       const endOfNextMonth = today
//         .clone()
//         .add(1, "month")
//         .endOf("month")
//         .format("MM-DD-YYYY");

//       console.log(startOfNextMonth, endOfNextMonth);

//       // Retrieve orders for the next month
//       const ordersNextMonth = await orderModel
//         .find({ orderDate: { $gte: startOfNextMonth, $lte: endOfNextMonth } })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       console.log("orders for next month:", ordersNextMonth);

//       // Send the orders in the response
//       res.render("Sortingorders", {
//         title: "Order List",
//         data: ordersNextMonth,
//       });
//     } else if (value === "Yearly") {
//       console.log("Yearly");

//       const startOfYear = today.clone().startOf("year").format("MM-DD-YYYY");
//       // End of the current year
//       const endOfYear = today.clone().endOf("year").format("MM-DD-YYYY");

//       console.log(startOfYear, endOfYear);

//       const order = await orderModel
//         .find({ orderDate: { $gte: startOfYear, $lte: endOfYear } })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       res.render("Sortingorders", {
//         title: "Order List",
//         message: "",
//         data: order,
//       });
//     } else if (value === "3Month") {
//       // Start of three months ago
//       const startOfThreeMonthsAgo = today
//         .clone()
//         .subtract(2, "months")
//         .startOf("month")
//         .format("MM-DD-YYYY");

//       // End of the current month (which serves as the end of the three-month period)
//       const endOfThreeMonthsAgo = today
//         .clone()
//         .endOf("month")
//         .format("MM-DD-YYYY");

//       const order = await orderModel
//         .find({
//           orderDate: { $gte: startOfThreeMonthsAgo, $lte: endOfThreeMonthsAgo },
//         })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       res.render("Sortingorders", {
//         title: "Order List",
//         message: "",
//         data: order,
//       });
//     } else if (value === "6Month") {
//       console.log("6Mounth");

//       const startOfThreeMonthsAgo = today
//         .clone()
//         .subtract(5, "months")
//         .startOf("month")
//         .format("MM-DD-YYYY");
//       // End of the current month (which serves as the end of the three-month period)
//       const endOfThreeMonthsAgo = today
//         .clone()
//         .endOf("month")
//         .format("MM-DD-YYYY");
//       const order = await orderModel
//         .find({
//           orderDate: { $gte: startOfThreeMonthsAgo, $lte: endOfThreeMonthsAgo },
//         })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       res.render("Sortingorders", {
//         title: "Order List",
//         message: "",
//         data: order,
//       });
//     } else if (value === "9Month") {
//       console.log("9Mounth");
//       const startOfNineMonthsAgo = today
//         .clone()
//         .subtract(8, "months")
//         .startOf("month")
//         .format("MM-DD-YYYY");

//       // End of the current month (which serves as the end of the three-month period)
//       const endOfNineMonthsAgo = today
//         .clone()
//         .endOf("month")
//         .format("MM-DD-YYYY");
//       const order = await orderModel
//         .find({
//           orderDate: { $gte: startOfNineMonthsAgo, $lte: endOfNineMonthsAgo },
//         })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       res.render("Sortingorders", {
//         title: "Order List",
//         message: "",
//         data: order,
//       });
//     } else if (value === "nextWeek") {
//       // Calculate start and end dates for the next week
//       const startOfNextWeek = today
//         .clone()
//         .add(1, "week")
//         .startOf("week")
//         .format("MM-DD-YYYY");
//       const endOfNextWeek = today
//         .clone()
//         .add(1, "week")
//         .endOf("week")
//         .format("MM-DD-YYYY");

//       console.log(startOfNextWeek, endOfNextWeek);

//       // Retrieve orders for the next week
//       const ordersNextWeek = await orderModel
//         .find({ orderDate: { $gte: startOfNextWeek, $lte: endOfNextWeek } })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       console.log("orders for next week:", ordersNextWeek);

//       // Send the orders in the response
//       res.render("Sortingorders", {
//         title: "Order List",
//         data: ordersNextWeek,
//       });
//     } else {
//       const startOfWeek = today.clone().startOf("week").format("MM-DD-YYYY"); // Start of the current week (Sunday)
//       const endOfWeek = today.clone().endOf("week").format("MM-DD-YYYY");
//       console.log(startOfWeek, endOfWeek);

//       const order = await orderModel
//         .find({ orderDate: { $gte: startOfWeek, $lte: endOfWeek } })
//         .populate({ path: "userId" })
//         .populate({ path: "addressId" })
//         .sort({ created_at: -1 });

//       res.render("Sortingorders", {
//         title: "Order List",
//         message: "",
//         data: order,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });
router.get("/reportList", authenticateAdmin, async function (req, res, next) {
	try {
		const value = req.query.value;
		const userId = req.query.userId; // Extract userId from query
		const today = moment();
		const startDate = req.query.startDate; // Extract startDate from query
		const endDate = req.query.endDate;
		// Create a base query object
		let query = {};

		// Apply date range based on the `value`
		if (value === "All") {
			// No date filter, but can include userId filter if provided
		} else if (value === "Monthly") {
			const startOfMonth = today.clone().startOf("month").format("MM-DD-YYYY");
			const endOfMonth = today.clone().endOf("month").format("MM-DD-YYYY");
			query.orderDate = { $gte: startOfMonth, $lte: endOfMonth };
		} else if (value === "nextMonth") {
			const startOfNextMonth = today
				.clone()
				.add(1, "month")
				.startOf("month")
				.format("MM-DD-YYYY");
			const endOfNextMonth = today
				.clone()
				.add(1, "month")
				.endOf("month")
				.format("MM-DD-YYYY");
			query.orderDate = { $gte: startOfNextMonth, $lte: endOfNextMonth };
		} else if (value === "Yearly") {
			const startOfYear = today.clone().startOf("year").format("MM-DD-YYYY");
			const endOfYear = today.clone().endOf("year").format("MM-DD-YYYY");
			query.orderDate = { $gte: startOfYear, $lte: endOfYear };
		} else if (value === "3Month") {
			const startOfThreeMonthsAgo = today
				.clone()
				.subtract(2, "months")
				.startOf("month")
				.format("MM-DD-YYYY");
			const endOfThreeMonthsAgo = today
				.clone()
				.endOf("month")
				.format("MM-DD-YYYY");
			query.orderDate = {
				$gte: startOfThreeMonthsAgo,
				$lte: endOfThreeMonthsAgo,
			};
		} else if (value === "6Month") {
			const startOfSixMonthsAgo = today
				.clone()
				.subtract(5, "months")
				.startOf("month")
				.format("MM-DD-YYYY");
			const endOfSixMonthsAgo = today
				.clone()
				.endOf("month")
				.format("MM-DD-YYYY");
			query.orderDate = { $gte: startOfSixMonthsAgo, $lte: endOfSixMonthsAgo };
		} else if (value === "9Month") {
			const startOfNineMonthsAgo = today
				.clone()
				.subtract(8, "months")
				.startOf("month")
				.format("MM-DD-YYYY");
			const endOfNineMonthsAgo = today
				.clone()
				.endOf("month")
				.format("MM-DD-YYYY");
			query.orderDate = {
				$gte: startOfNineMonthsAgo,
				$lte: endOfNineMonthsAgo,
			};
		} else if (value === "nextWeek") {
			const startOfNextWeek = today
				.clone()
				.add(1, "week")
				.startOf("week")
				.format("MM-DD-YYYY");
			const endOfNextWeek = today
				.clone()
				.add(1, "week")
				.endOf("week")
				.format("MM-DD-YYYY");
			query.orderDate = { $gte: startOfNextWeek, $lte: endOfNextWeek };
		} else {
			const startOfWeek = today.clone().startOf("week").format("MM-DD-YYYY");
			const endOfWeek = today.clone().endOf("week").format("MM-DD-YYYY");
			query.orderDate = { $gte: startOfWeek, $lte: endOfWeek };
		}

		// Apply userId filter if provided
		if (userId) {
			query.userId = userId;
		}

		if (startDate && endDate) {
			query.orderDate = { $gte: startDate, $lte: endDate };
		}
		// Fetch the orders with the constructed query
		const orders = await orderModel
			.find(query)
			.populate({ path: "userId" })
			.populate({ path: "addressId" })
			.sort({ created_at: -1 });

		// Fetch users for the dropdown
		const users = await userData.find(); // Adjust as necessary to get the list of users

		// Render the result
		res.render("Sortingorders", {
			title: "Order List",
			data: orders,
			users: users, // Pass the list of users to the view
		});
	} catch (error) {
		console.log(error);
		res.status(500).send("Internal Server Error");
	}
});

//sub admin delete
router.post("/deleteSubAdmin", authenticateAdmin, async (req, res, next) => {
	try {
		let id = req.body.id;
		const subAdmin = await adminData.findByIdAndRemove(id);
		if (subAdmin) {
			res.redirect("/adminuserlist");
		}
	} catch (error) {
		console.log("error.......", error);
		res.redirect("/adminuserlist");
	}
});

//edit subadmin page
router.get("/editSubAdmin/:id", authenticateAdmin, async (req, res, next) => {
	let subAdminId = req.params.id;

	const subAdmin = await adminData.findById(subAdminId);

	console.log("ad......", subAdmin);

	res.render("editSubAdmin", { title: "Edit Sub Admin", data: subAdmin });
});

//edit sub admin
router.post(
	"/edit_subAdmin",
	authenticateAdmin,
	s3image.upload.single("image"),
	async (req, res, next) => {
		try {
			const subAdminId = req.body.id;

			if (req.file) {
				console.log("file........", req.file, req.body);
				const updateSubAdmin = await adminData.findByIdAndUpdate(
					subAdminId,
					{
						image: req.file.location,
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						mobile: req.body.mobile,
					},
					{ new: true }
				);
				return res.redirect("/adminuserlist");
			}

			const updateSubAdmin = await adminData.findByIdAndUpdate(
				subAdminId,
				{
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					mobile: req.body.mobile,
				},
				{ new: true }
			);
			res.redirect("/adminuserlist");
		} catch (error) {
			console.log(error);
			res.redirect("/adminuserlist");
		}
	}
);

//delete particular menu
router.post("/itemMenuDelete", authenticateAdmin, async (req, res, next) => {
	try {
		console.log("req.......", req.body, req.query);
		if (req.body.categoryName === "Breakfast") {
			let id = req.body.id;
			const breakFastDelete = await breakfastModule.findByIdAndRemove(id);
			if (breakFastDelete) {
				res.redirect("/getList?value=1");
			}
		} else if (req.body.categoryName === "AM Snack") {
			let id = req.body.id;
			const breakFastDelete = await amSnackData.findByIdAndRemove(id);
			if (breakFastDelete) {
				res.redirect("/getList?value=2");
			}
		} else if (req.body.categoryName === "Lunch") {
			let id = req.body.id;
			const lunchDelete = await lunchModule.findByIdAndRemove(id);
			if (lunchDelete) {
				res.redirect("/getList?value=3");
			}
		} else if (req.body.categoryName === "Supper") {
			let id = req.body.id;
			const lunchDelete = await supperModel.findByIdAndRemove(id);
			if (lunchDelete) {
				res.redirect("/getList?value=6");
			}
		} else if (req.body.categoryName === "Vegetarian") {
			let id = req.body.id;
			const lunchDelete = await vegetarianModel.findByIdAndRemove(id);
			if (lunchDelete) {
				res.redirect("/getList?value=7");
			}
		} else if (req.body.categoryName === "Box Lunches") {
			let id = req.body.id;
			const lunchDelete = await boxLunchesModel.findByIdAndRemove(id);
			if (lunchDelete) {
				res.redirect("/getList?value=4");
			}
		} else {
			let id = req.body.id;
			const pmSnacDelete = await pmSnackModel.findByIdAndRemove(id);
			if (pmSnacDelete) {
				res.redirect("/getList?value=5");
			}
		}
	} catch (error) {
		console.log("error.......", error);
		req.flash("error_msg", "Something went wrong");
		res.redirect("/getList?value=1");
	}
});

//open page add driver
router.get("/addNewDriver", authenticateAdmin, async (req, res, next) => {
	const drivers = await driverModel.find().lean();

	res.render("addNewDriver", { title: "Add New Driver" });
});

//add new Dreiver
router.post(
	"/add_driver",
	authenticateAdmin,
	uploadImage.upload.fields([
		{ name: "image" },
		{ name: "licenseImage" },
		{ name: "InsuranceImage" },
	]),
	async function (req, res, next) {
		try {
			let {
				firstName,
				lastName,
				email,
				mobileNumber,
				address1,
				address2,
				city,
				state,
				zipCode,
				vehicleBrand,
				vehicleModel,
				year,
				licencePlate,
				color,
				licenseNumber,
				licenseIssueState,
			} = req.body;
			var password = generator.generate({
				length: 10,
				numbers: true,
			});

			console.log("file.........", req.files);
			console.log("file.........", req.body);

			// Access uploaded files
			let imageFile; // Assuming only one file is uploaded per field
			let licenseImageFile;
			let insuranceImageFile;

			if (req.files) {
				if (req.files["image"] && req.files["image"][0].location) {
					imageFile = req.files["image"][0].location;
				}
				if (
					req.files["licenseImage"] &&
					req.files["licenseImage"][0].location
				) {
					licenseImageFile = req.files["licenseImage"][0].location;
				}
				if (
					req.files["InsuranceImage"] &&
					req.files["InsuranceImage"][0].location
				) {
					insuranceImageFile = req.files["InsuranceImage"][0].location;
				}
			}

			console.log(
				"imagePath.......",
				imageFile,
				licenseImageFile,
				insuranceImageFile
			);

			const driver = await driverModel.findOne({ email: email });

			if (driver) {
				req.flash("error", "You have already used this email before");
				return res.render("add_driver", { message: req.flash("error") });
			}

			const driverRegister = new driverModel({
				firstName: firstName,
				lastName: lastName,
				mobileNumber: mobileNumber,
				image: imageFile,
				password: password,
				email: email,
				address1: address1,
				address2: address2,
				city: city,
				state: state,
				zipCode: zipCode,
				vehicle: {
					vehicleBrand: vehicleBrand,
					vehicleModel: vehicleModel,
					year: year,
					licencePlate: licencePlate,
					color: color,
				},
				document: {
					licenseNumber: licenseNumber,
					licenseIssueState: licenseIssueState,
					licenseImage: licenseImageFile,
					InsuranceImage: insuranceImageFile,
				},
				isAdminApprove: true,
			});

			const token = await driverRegister.userAuthToken();
			let save = await driverRegister.save();

			if (save) {
				await sendmail2(
					save.email,
					"Welcome to Jeffery! You've been accepted as a driver.",
					welcomeDriver({
						email: save.email,
						firstName: save.firstName,
						lastName: save.lastName,
						password: password,
					})
				);
				return res.redirect("/driversList");
			}
		} catch (error) {
			console.log("error.........", error);
			res.redirect("/driversList");
		}
	}
);

//delete driver
router.post("/deleteDriver", authenticateAdmin, async (req, res, next) => {
	try {
		let id = req.body.id;
		const deleteDriver = await driverModel.findByIdAndRemove(id);
		if (deleteDriver) {
			res.redirect("/driversList");
		}
	} catch (error) {
		console.log("error.......", error);
		res.redirect("/driversList");
	}
});

//chnage order address
router.post("/editOrderAddress", authenticateAdmin, async (req, res, next) => {
	try {
		console.log("orderId.......", req.body.orderId);
		console.log("addressId.......", req.body.addressId);

		const order = await orderModel.findById(req.body.orderId);

		if (order) {
			order.addressId = req.body.addressId;
			await order.save();
			console.log("order.......", order);
			res.redirect(`/orderviewlist?orderId=${req.body.orderId}`);
		} else {
			res.redirect(`/orderviewlist?orderId=${req.body.orderId}`);
		}
	} catch (error) {
		console.log("error.........", error);
	}
});

router.get("/editAddress/:id", authenticateAdmin, async (req, res, next) => {
	try {
		let addressId = req.params.id;
		const address = await userAddressModel.findById(addressId);
		res.render("editAddress", { title: "Edit Address", data: address });
	} catch (error) {
		console.log("error.........", error);
	}
});

router.post("/updateAddress", async (req, res, next) => {
	try {
		let {
			streetAddress,
			city,
			state,
			zipCode,
			phoneNumber,
			locationName,
			latitude,
			longitude,
			addressId,
		} = req.body;

		console.log("req..........", req.body);
		console.log("req file..........", req.files);

		const address = await userAddressModel.findById(addressId);
		if (!address) return res.redirect(`/editAddress/${addressId}`);
		address.streetAddress = streetAddress
			? streetAddress
			: address.streetAddress;
		address.city = city !== undefined && city !== null ? city : "";
		address.state = state !== undefined && state !== null ? state : "";
		address.zipCode = zipCode !== undefined && zipCode !== null ? zipCode : "";
		address.phoneNumber = phoneNumber ? phoneNumber : address.phoneNumber;
		address.locationName = locationName ? locationName : address.locationName;
		if (latitude && longitude) {
			address.location = {
				type: "Point",
				coordinates: [longitude, latitude],
			};
		}
		let result = await address.save();

		if (result) {
			return res.redirect("/clientList");
		} else {
			return res.redirect(`/editAddress/${addressId}`);
		}
	} catch (error) {
		console.log("error........", error);
		return res.redirect(`/editAddress/${addressId}`);
		// res.status(500).json({
		//   status: 0,
		//   message: 'Something went wrong please try again later.'
		// })
	}
});

//get drivers
router.get("/editDriver/:id", authenticateAdmin, async (req, res, next) => {
	try {
		let driverId = req.params.id;
		console.log("driver........", driverId);
		const driver = await driverModel.findById(driverId);
		res.render("editDriver", { title: "Edit Driver", data: driver });
	} catch (error) {
		console.log("error.........", error);
	}
});

//update profile
router.post(
	"/updateDriver",
	uploadImage.upload.fields([
		{ name: "image" },
		{ name: "licenseImage" },
		{ name: "InsuranceImage" },
	]),
	async (req, res, next) => {
		try {
			let {
				firstName,
				lastName,
				email,
				mobileNumber,
				address1,
				address2,
				city,
				state,
				zipCode,
				vehicleBrand,
				vehicleModel,
				year,
				licencePlate,
				color,
				licenseNumber,
				driverId,
			} = req.body;

			console.log("req..........", req.body);
			console.log("req file..........", req.files);

			const user = await driverModel.findById(driverId);
			if (!user) return res.redirect(`/editDriver/${driverId}`);

			if (req.files) {
				user.image = req.files["image"]
					? req.files["image"][0].location
					: user.image;
				user.licenseImage = req.files["licenseImage"]
					? req.files["licenseImage"][0].location
					: user.licenseImage;
				user.InsuranceImage = req.files["InsuranceImage"]
					? req.files["InsuranceImage"][0].location
					: user.InsuranceImage;
			}
			user.firstName = firstName ? firstName : user.firstName;
			user.lastName = lastName ? lastName : user.lastName;
			user.email = email ? email : user.email;
			user.mobileNumber = mobileNumber ? mobileNumber : user.mobileNumber;
			user.address1 = address1 ? address1 : user.address1;
			user.address2 = address2 ? address2 : user.address2;
			user.city = city ? city : user.city;
			user.state = state ? state : user.state;
			user.zipCode = zipCode ? zipCode : user.zipCode;
			user.vehicle.vehicleBrand = vehicleBrand
				? vehicleBrand
				: user.vehicle.vehicleBrand;
			user.vehicle.vehicleModel = vehicleModel
				? vehicleModel
				: user.vehicle.vehicleModel;
			user.vehicle.year = year ? year : user.vehicle.year;
			user.vehicle.licencePlate = licencePlate
				? licencePlate
				: user.vehicle.licencePlate;
			user.vehicle.color = color ? color : user.vehicle.color;
			user.document.licenseNumber = licenseNumber
				? licenseNumber
				: user.vehicle.licenseNumber;

			let result = await user.save();

			if (result) {
				return res.redirect("/driversList");
			} else {
				return res.redirect(`/editDriver/${driverId}`);
			}
		} catch (error) {
			console.log("error........", error);
			return res.redirect(`/editDriver/${driverId}`);
			// res.status(500).json({
			//   status: 0,
			//   message: 'Something went wrong please try again later.'
			// })
		}
	}
);

//approved driver
// Function to approve driver and send approval email
router.post("/approveDrive", authenticateAdmin, async (req, res, next) => {
	try {
		console.log("req......", req.body);

		const driver = await driverModel.findById(req.body.id);
		if (driver) {
			const isAdminApprove = JSON.parse(req.body.isAdminApprove);

			// Update driver's approval status
			const update = await driverModel.findByIdAndUpdate(
				driver._id,
				{ $set: { isAdminApprove: isAdminApprove } },
				{ new: true }
			);

			// Send approval email if admin approval is true
			if (isAdminApprove) {
				const emailSubject = "Your Profile Approval";
				const emailHtml = `
          <html>
          <head>
            <style>
              /* Add your CSS styles here */
              body {
                font-family: 'Arial', sans-serif;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
              }
              .logo {
                max-width: 100px;
              }
              .driver-info {
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="http://52.7.244.188:3000/assets/images/LoginLogo.png" alt="Company Logo" class="logo">
              <h2>Your Profile Approval</h2>
              <div class="driver-info">
                <img src="${driver.image}" alt="Driver Image" style="max-width: 100px;">
                <h3>${driver.firstName} ${driver.lastName}</h3>
                <p>Your profile has been approved by the admin. You can now start accepting orders and delivering.</p>
              </div>
            </div>
          </body>
          </html>
        `;

				// Send email
				await sendMail(driver.email, emailSubject, emailHtml);
			}

			res.redirect("/driversList");
		} else {
			res.redirect("/driversList");
		}
	} catch (error) {
		req.flash("error_msg", "Oops sometning wrong");
		console.log("error.........", error);
		res.redirect("/driversList");
	}
});

//notification page
router.get("/notification", authenticateAdmin, async (req, res, next) => {
	res.render("notification", { title: "Notification Page" });
});

//get notifications list
router.get("/notificationsList", authenticateAdmin, async (req, res, next) => {
	try {
		if (req.user) {
			let adminId = req.user._id;
			let adminPass = await adminData.findById(adminId);
			const notificationAdmin = await notificationModel
				.find({ receiverId: adminPass._id })
				.sort({ notificationSendAt: -1 })
				.populate({
					path: "orderId",
					populate: {
						path: "addressId", // Assuming Order schema has addressId field
						model: "userAddressModel", // Reference to the Address model
						select: "locationName streetAddress city state zipCode",
					},
				});
			let notificationDetails = await notificationModel.countDocuments({
				receiverId: adminPass._id,
				isReadByReceiver: false,
			});

			console.log("notificationDetails.........", notificationDetails);

			if (notificationAdmin) {
				return res.status(200).json({
					status: "success",
					notification: notificationAdmin,
					notificationCount: notificationDetails,
				});
			}
		} else {
			req.flash("error_msg", "Oops sometning wrong");
			return res.redirect("/");
		}
	} catch (error) {
		console.log("error.........", error);
		req.flash("error_msg", "Oops sometning wrong");
		res.redirect("/dashboard");
	}
});

//read notification
//notification read by receiver
router.post("/readNotifications", authenticateAdmin, async (req, res, next) => {
	try {
		let adminId = req.user._id;
		let adminPass = await adminData.findById(adminId);
		if (!adminPass) {
			req.flash("error_msg", "Oops sometning wrong");
			return res.redirect("/dashboard");
		}

		console.log("ids.....", req.body.isReadByReceiver);

		const updatedNotifications = await notificationModel.updateMany(
			{ receiverId: adminPass._id },
			{
				isReadByReceiver: req.body.isReadByReceiver,
			}
		);

		if (updatedNotifications.nModified === 0) {
			return res.json({ error: "No notifications were updated" });
		}
		res.json({ message: "Notifications updated successfully" });
	} catch (error) {
		console.log("error.....", error);
		req.flash("error_msg", "Oops sometning wrong");
		res.redirect("/dashboard");
	}
});

//assign order to driver
router.post("/assignOrder", authenticateAdmin, async (req, res, next) => {
	try {
		console.log("req.body.......", req.body);

		let adminId = req.user._id;
		let adminPass = await adminData.findById(adminId);
		if (!adminPass) {
			req.flash("error_msg", "Oops sometning wrong");
			return res.redirect("/");
		}

		const order = await orderModel.findById(req.body.orderId).populate({
			path: "addressId",
			select: "locationName",
		});

		console.log("order.....", order);
		const driver = await driverModel.findById(req.body.driverId);

		if (order) {
			order.driverId = driver._id;
			order.isOrderAssign = req.body.isOrderAssign;
			await order.save();

			let title = "Important: Delivery Assignment.";
			let body = `New delivery order ${order.orderCode} assigned to you. Check your app for details.`;
			let appointment_type = "new_assigned";

			let data = {
				receiverId: driver._id,
				senderId: adminPass._id,
				senderId_image: adminPass.image,
				senderId_name: `${adminPass.firstName} ${adminPass.lastName}`,
				notificationSendTo: "user",
				orderId: order._id,
				orderCode: order.orderCode,
				title: title,
				body: body,
				type: appointment_type,
			};

			await sendNotification(data);

			req.flash("success_msg", "Driver assigned successfully.");
			return res.redirect(`/reportList?value=All`);
		} else {
			req.flash("error_msg", "Oops sometning wrong");
			return res.redirect(`/reportList?value=All`);
		}
	} catch (error) {
		// Handle errors
		console.log("error.......", error);
		req.flash("error_msg", "Oops sometning wrong");
		return res.redirect("/reportList");
	}
});

//delete all admin notitfication
router.delete(
	"/deleteAdminNotifications",
	authenticateAdmin,
	async (req, res, next) => {
		try {
			if (req.user) {
				let adminId = req.user._id;
				let adminPass = await adminData.findById(adminId);
				await notificationModel.deleteMany({ receiverId: adminPass._id }); // Delete notifications with received_id as 'admin'

				// Send a success response
				req.flash("success_msg", "Deleted all notification successfully.");
				return res.redirect("/notification");
			} else {
				req.flash("error_msg", "Oops sometning wrong");
				return res.redirect("/");
			}
		} catch (error) {
			// Handle errors
			req.flash("error_msg", "Oops sometning wrong");
			return res.redirect("/");
		}
	}
);

//delete notification
router.post(
	"/deleteAdminNotificationsOne",
	authenticateAdmin,
	async (req, res, next) => {
		try {
			if (req.user) {
				const notificationId = req.body.ID;
				// Delete notifications by their IDs for the admin user
				await notificationModel.findByIdAndDelete(notificationId);

				// Send a success response
				req.flash(
					"success_msg",
					"Selected notifications deleted successfully."
				);
				return res.redirect("/notification");
			} else {
				req.flash("error_msg", "Oops something wrong");
				return res.redirect("/");
			}
		} catch (error) {
			// Handle errors
			console.error(error); // Log the error for debugging
			req.flash("error_msg", "Oops something wrong");
			return res.redirect("/");
		}
	}
);

//change driver
router.post("/changeDriver", authenticateAdmin, async (req, res, next) => {
	try {
		let adminId = req.user._id;
		let adminPass = await adminData.findById(adminId);
		if (!adminPass) {
			req.flash("error_msg", "Oops sometning wrong");
			return res.redirect("/");
		}

		const order = await orderModel.findById(req.body.orderId);
		const driver = await driverModel.findById(req.body.driverId);

		if (order) {
			order.driverId = driver._id;
			order.isOrderAssign = req.body.isOrderAssign;
			await order.save();

			let title = "Important: Delivery Assignment.";
			let body = `A new delivery order has been assigned to you. Please check your app for further details and take action accordingly.`;
			let appointment_type = "new_assigned";

			let data = {
				receiverId: driver._id,
				senderId: adminPass._id,
				senderId_image: adminPass.image,
				senderId_name: `${adminPass.firstName} ${adminPass.lastName}`,
				notificationSendTo: "user",
				orderId: order._id,
				title: title,
				body: body,
				type: appointment_type,
			};

			await sendNotification(data);

			req.flash("success_msg", "Driver assigned successfully.");
			return res.redirect(`/orderviewlist?orderId=${req.body.orderId}`);
		} else {
			req.flash("error_msg", "Oops sometning wrong");
			return res.redirect(`/orderviewlist?orderId=${req.body.orderId}`);
		}
	} catch (error) {
		// Handle errors
		req.flash("error_msg", "Oops sometning wrong");
		return res.redirect("/reportList");
	}
});

//approved driver
router.post("/approveUserClient", authenticateAdmin, async (req, res, next) => {
	try {
		const user = await userData.findById(req.body.id);

		console.log("user....", user);
		if (user) {
			const isAdminApprove = JSON.parse(req.body.isAdminApprove);

			// Update driver's approval status
			const update = await userData.findByIdAndUpdate(
				user._id,
				{ $set: { isAdminApprove: isAdminApprove } },
				{ new: true }
			);

			// Send approval email if admin approval is true
			if (isAdminApprove) {
				const emailSubject = "Your Profile Approval";
				const emailHtml = `
          <html>
          <head>
            <style>
              /* Add your CSS styles here */
              body {
                font-family: 'Arial', sans-serif;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
              }
              .logo {
                max-width: 100px;
              }
              .driver-info {
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="http://52.7.244.188:3000/assets/images/LoginLogo.png" alt="Company Logo" class="logo">
              <h2>Your Profile Approval</h2>
              <div class="driver-info">
                <img src="${user.image}" alt="user Image" style="max-width: 100px;">
                <h3>${user.firstName} ${user.lastName}</h3>
                <p>Your profile has been approved by the admin. You can now log in to your account and start exploring our menu to place orders.</p>
                    <p>If you need any assistance, please don't hesitate to contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `;

				// Send email
				await sendmail2(user.email, emailSubject, emailHtml);
			}
			req.flash("success_msg", "Client approved successfully.");
			return res.redirect("/clientList");
		} else {
			req.flash("error_msg", "Something went wrong please try again later.");
			return res.redirect("/clientList");
		}
	} catch (error) {
		req.flash("error_msg", "Something went wrong please try again later.");
		console.log("error.........", error);
		res.redirect("/clientList");
	}
});

module.exports = router;
