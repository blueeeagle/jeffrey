const driverModel = require("../../../models/driver");
const bcrypt = require("bcryptjs");
const forgotTemp = require("../../../middleware/sendLinkEmail");
const sendEmail = require("../../../utils/sendmail2");
const jwt = require("jsonwebtoken");
const orderData = require("../../../models/ordermodel");
const notificationModel = require("../../../models/notification");
const pagination = require("../../../middleware/pagination");
const createPdf = require("../../../middleware/createPdf");
const invoicePDF = require("../../../middleware/invoicePDF");
const adminData = require("../../../models/adminmodel");

//register
exports.registerUser = async (req, res, next) => {
  try {
    let {
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      address1,
      address2,
      city,
      state,
      zipCode,
      vehicleBrand,
      vehicleModel,
      year,
      licensePlate,
      color,
      licenseNumber,
      licenseIssueState,
    } = req.body;

    const driver = await driverModel.findOne({ email: email });
    if (driver) {
      return res
        .status(400)
        .json({ status: 0, message: "You have used this email before." });
    }
    // Access uploaded files
    let imageFile; // Assuming only one file is uploaded per field
    let licenseImageFile;
    let insuranceImageFile;

    if (req.files) {
      if (req.files["image"] && req.files["image"][0].location) {
        imageFile = req.files["image"][0].location;
      }
      if (req.files["licenseImage"] && req.files["licenseImage"][0].location) {
        licenseImageFile = req.files["licenseImage"][0].location;
      }
      if (
        req.files["InsuranceImage"] &&
        req.files["InsuranceImage"][0].location
      ) {
        insuranceImageFile = req.files["InsuranceImage"][0].location;
      }
    }

    const driverRegister = new driverModel({
      firstName: firstName,
      lastName: lastName,
      mobileNumber: mobileNumber,
      image: imageFile,
      password: password,
      email: email.toLowerCase(),
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      zipCode: zipCode,
      vehicle: {
        vehicleBrand: vehicleBrand,
        vehicleModel: vehicleModel,
        year: year,
        licensePlate: licensePlate,
        color: color,
      },
      document: {
        licenseNumber: licenseNumber,
        licenseIssueState: licenseIssueState,
        licenseImage: licenseImageFile,
        InsuranceImage: insuranceImageFile,
      },
    });
    const token = await driverRegister.userAuthToken();
    let result = await driverRegister.save();
    if (result) {

      let adminPass = await adminData.findOne()

       // Send notification to the admin for new driver registration and profile approval
       let title = 'New Driver Registration'
       let body = `A new Client has registered. Please review and approve their profile.`
       let type = 'new_driver_registration'
 
       let data = {
         receiverId: adminPass._id, // Specify the admin's user ID here
         senderId: result._id, // Use the result of save() to get the driver's _id
         senderId_name: `${result.firstName} ${result.lastName}`,
         senderId_image:result.image,
         notificationSendTo: 'admin',
         title: title,
         body: body,
         type: type
       }

       await sendNotification(data)

      return res.status(200).json({
        status: 1,
        message:
          "Registration Successful ! Your account is pending admin approval.",
        data: result,
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Something went wrong please try again later",
      });
    }
  } catch (error) {
    console.log("error.......", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//login
exports.Login = async (req, res, next) => {
  try {
    const reqBody = req.body;
    const { email, password, deviceToken, deviceType } = reqBody;

    console.log(reqBody);

    const findUser = await driverModel.findOne({ email: { $regex: new RegExp('^' + email, 'i') } });
    console.log("findUser.....", findUser);
    // Check if user exists and password is correct
    if (!findUser || findUser.isDeleted || !findUser.validPassword(password)) {
      return res.status(400).json({status: 0, message: "Invalid email or password" });
    }
    // Check if user is approved by admin
    if (!findUser.isAdminApprove) {
      return res
        .status(400)
        .json({status: 0, message: "Your profile is not approved by admin" });
    }

    const matchPassword = await bcrypt.compare(password, findUser.password);

    console.log("matchPassword.........", matchPassword);

    if (!matchPassword)
      return res.status(400).json({ status: 0, message: "Invalid password." });

    if (deviceToken || deviceType) {
      findUser.deviceType = deviceType;
      findUser.deviceToken = deviceToken;

      await findUser.save();
    }

    if (findUser) {
      const token = await findUser.userAuthToken();
      findUser.password = undefined;
      return res
        .status(200)
        .json({ status: 1, message: "Login successfully.", data: findUser });
    }
  } catch (error) {
    console.log("error......", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//change password
exports.changePassword = async (req, res, next) => {
  try {
    const user = await driverModel.findById(req.user._id);
    if (!user)
      return res
        .status(400)
        .json({ status: 0, message: "Current driver not found" });
    if (!user.validPassword(req.body.oldPassword)) {
      return res
        .status(400)
        .json({ status: 0, message: "invalid old password " });
    }
    if (req.body.oldPassword === req.body.newPassword) {
      return res.status(400).json({
        status: 0,
        message: "New password cannot be the same as your current password",
      });
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10);

    const updatePassword = await driverModel.findByIdAndUpdate(
      { _id: user._id },
      user
    );
    res.status(200).json({
      status: 1,
      message: "Your password has been successfully reset.",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//update profile
exports.updateUser = async (req, res, next) => {
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
      //   vehicleBrand,
      //   vehicleModel,
      //   year,
      //   licensePlate,
      //   color,
      //   licenseNumber
    } = req.body;

    const user = await driverModel.findById(req.user._id);
    if (!user)
      return res.status(400).json({ status: 0, message: "User not found" });

    // Access uploaded files
    let imageFile; // Assuming only one file is uploaded per field
    let licenseImageFile;
    let insuranceImageFile;

    if (req.file) {
      user.image = req.file.location ? req.file.location : user.image;
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
    // user.vehicle.vehicleBrand = vehicleBrand ? vehicleBrand :user.vehicle.vehicleBrand
    // user.vehicle.vehicleModel = vehicleModel ? vehicleModel :user.vehicle.vehicleModel
    // user.vehicle.year = year ? year :user.vehicle.year
    // user.vehicle.licensePlate = licensePlate ? licensePlate :user.vehicle.licensePlate
    // user.vehicle.color = color ? color :user.vehicle.color
    // user.document.licenseNumber = licenseNumber ? licenseNumber :user.vehicle.licenseNumber
    // user.document.licenseImage = licenseImageFile
    // user.document.InsuranceImage=insuranceImageFile

    let result = await user.save();

    if (result) {
      return res.status(200).json({
        status: 1,
        message: "Your profile Updated successfully.",
        data: result,
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Something went wrong please try again later.",
      });
    }
  } catch (error) {
    console.log("error........", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//update vehicle
exports.updateVehicle = async (req, res, next) => {
  try {
    let { vehicleBrand, vehicleModel, year, licensePlate, color } = req.body;
    const user = await driverModel.findById(req.user._id);
    if (!user)
      return res.status(400).json({ status: 0, message: "User not found" });

    user.vehicle.vehicleBrand = vehicleBrand
      ? vehicleBrand
      : user.vehicle.vehicleBrand;
    user.vehicle.vehicleModel = vehicleModel
      ? vehicleModel
      : user.vehicle.vehicleModel;
    user.vehicle.year = year ? year : user.vehicle.year;
    user.vehicle.licensePlate = licensePlate
      ? licensePlate
      : user.vehicle.licensePlate;
    user.vehicle.color = color ? color : user.vehicle.color;

    let save = await user.save();

    if (save) {
      return res.status(200).json({
        status: 1,
        message: "Your vehicle Updated successfully.",
        data: save,
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Something went wrong please try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//update document
exports.updateDocument = async (req, res, next) => {
  try {
    let { licenseNumber, licenseIssueState } = req.body;
    const user = await driverModel.findById(req.user._id);
    if (!user)
      return res.status(400).json({ status: 0, message: "User not found" });

    let licenseImageFile;
    let insuranceImageFile;

    if (req.files) {
      licenseImageFile = req.files["licenseImage"][0].location
        ? req.files["licenseImage"][0].location
        : user.licenseImage;
      insuranceImageFile = req.files["InsuranceImage"][0].location
        ? req.files["InsuranceImage"][0].location
        : user.InsuranceImage;
    }

    user.document.licenseNumber = licenseNumber
      ? licenseNumber
      : user.vehicle.licenseNumber;
    user.licenseIssueState = licenseIssueState
      ? licenseIssueState
      : user.licenseIssueState;
    user.document.licenseImage = licenseImageFile;
    user.document.InsuranceImage = insuranceImageFile;

    let save = await user.save();

    if (save) {
      return res.status(200).json({
        status: 1,
        message: "Your vehicle Updated successfully.",
        data: save,
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Something went wrong please try again later.",
      });
    }
  } catch (error) {
    console.log("error......", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

exports.forgotEmailLink = async (req, res, next) => {
  try {
    const reqBody = req.body;

    console.log(reqBody);
    let user = await driverModel.findOne({ email: reqBody.email });

    if (!user)
      return res.status(400).json({ status: 0, message: "User not found" });

    let resetToken = await jwt.sign(
      { data: reqBody.email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );

    console.log("resetToken.....", resetToken);

    const updateLink = await driverModel.updateOne(
      { email: reqBody.email },
      { $set: { resetToken: resetToken } }
    );

    let mailUrl =
      process.env.BASE_URL +
      "/api/driver/userResetPassword?token=" +
      resetToken;

    sendEmail(user.email, "Forgot Password", forgotTemp({ url: mailUrl }));

    user.resetToken = undefined;
    await user.save();

    res.status(200).json({
      status: 1,
      message: "Please check your email to reset your password.",
    });
  } catch (error) {
    console.log("error.......", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//render reset page
exports.webResetPass = async (req, res, next) => {
  try {
    if (req.query.token == undefined) {
      return res.send("Please enter a token or invalid");
    }

    let token = req.query.token;

    let user = await driverModel.findOne({ resetToken: token });

    if (!user) return res.send("Invelid Link");

    res.render("forgorEmailPage", { req: req });
  } catch (error) {
    res.status(500).json({ status: 0, message: USER.commonError });
  }
};

//resetpass forgot
exports.resetPass = async (req, res, next) => {
  try {
    let reqBody = req.body;
    console.log("reqBody.......", reqBody);

    if (reqBody.newPassword != reqBody.confirmPassword) {
      req.flash("error_msg", "confirm password not match");
      return res.redirect(
        process.env.BASE_URL +
          "/api/driver/userResetPassword?token=" +
          reqBody.resetToken
      );
    }

    let user = await driverModel.findOne({
      resetToken: reqBody.resetToken,
    });

    console.log("user....", user);

    if (!user) {
      req.flash("error_msg", "link invelid");
      return res.redirect(
        process.env.BASE_URL +
          "/api/driver/userResetPassword?token=" +
          reqBody.resetToken
      );
    } else {
      const password = await bcrypt.hash(reqBody.newPassword, 10);
      const updated_at = Date.now();

      const result = await driverModel.findByIdAndUpdate(
        { _id: user._id },
        {
          password: password,
          updated_at: updated_at,
          resetToken: null,
        },
        { new: true }
      );
      return res.render("forgotMsgSuccess");
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something Went Wrong, Please Try Again Later",
    });
  }
};

//getProfile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await driverModel.findById(req.user._id);
    if (!user)
      return res.status(400).json({ status: 0, message: "User not found" });
    if (user) {
      user.password = undefined;
      return res.status(200).json({
        status: 1,
        message: "User Details.",
        data: user,
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Something went wrong please try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//home page
exports.homePage = async (req, res, next) => {
  try {
    const { tab, page, limit } = req.body;
    const user = await driverModel.findById(req.user._id);
    if (!user)
      return res.status(400).json({ status: 0, message: "User not found" });

    if (tab === "new") {
      const order = await orderData
        .find({ driverId: user._id, orderStatus: "Upcoming" })
        .populate({ path: "userId", select: "firstName lastName userImage" })
        .sort({ orderDate: -1 });

      const orderArray = order.map((item) => {
        const location = (item.location && item.location.coordinates && item.location.coordinates.length === 2)
        ? {
          type: 'Point',
          coordinates: [
            item.location.coordinates[0] || 0, // Fallback to 0 if longitude is missing
            item.location.coordinates[1] || 0, // Fallback to 0 if latitude is missing
          ],
        }
        : { type: 'Point', coordinates: [0, 0] }; // Fallback location
        return (obj = {
          _id: item._id,
          orderCode: item.orderCode || "",
          firstName: item.userId.firstName || "",
          lastName: item.userId.lastName || "",
          userImage: item.userId.userImage || "",
          orderDate: item.orderDate || "",
          orderStatus: item.orderStatus || "",
          address: item.addressId || "",
          streetAddress:item.streetAddress || "",
          city:item.city || "",
          state:item.state || "",
          zipCode:item.zipCode || "",
          phoneNumber:item.phoneNumber || "",
          isDefault:item.isDefault || "",
          locationName:item.locationName || "",
          location:location,
          orderItems: item.orderItems || "",
          description: item.description || "",
          startHotTempValue: item.startHotTempValue || "",
          startHotTempDateAndTime: item.startHotTempDateAndTime || "",
          endHotTempValue: item.endHotTempValue || "",
          endHotTempDateAndTime: item.endHotTempDateAndTime || "",
          startColdTempValue: item.startColdTempValue || "",
          startColdTempDateAndTime: item.startColdTempDateAndTime || "",
          endColdTempValue: item.endColdTempValue || "",
          endColdTempDateAndTime: item.endColdTempDateAndTime || "",
          isOrderAssign: item.isOrderAssign || "",
          created_at: item.created_at || "",
        });
      });
      if (orderArray.length === 0)
        return res.status(200).json({ status: 1, message: "Order not found" });

      const pageOne = pagination.paginate(orderArray, page, limit);

      return res.status(200).json({
        status: 1,
        message: "Upcoming order list.",
        data: pageOne,
      });
    } else {
      const order = await orderData
        .find({
          driverId: user._id,
          orderStatus: "Delivered",
        })
        .populate({ path: "userId", select: "firstName lastName userImage" })
        .sort({ orderDate: -1 });

      const orderArray = order.map((item) => {
        const location = (item.location && item.location.coordinates && item.location.coordinates.length === 2)
        ? {
          type: 'Point',
          coordinates: [
            item.location.coordinates[0] || 0, // Fallback to 0 if longitude is missing
            item.location.coordinates[1] || 0, // Fallback to 0 if latitude is missing
          ],
        }
        : { type: 'Point', coordinates: [0, 0] }; // Fallback location
        return (obj = {
          _id: item._id,
          orderCode: item.orderCode || "",
          firstName: item.userId.firstName || "",
          lastName: item.userId.lastName || "",
          userImage: item.userId.userImage || "",
          orderDate: item.orderDate || "",
          orderStatus: item.orderStatus || "",
          address: item.addressId || "",
          streetAddress:item.streetAddress || "",
          city:item.city || "",
          state:item.state || "",
          zipCode:item.zipCode || "",
          phoneNumber:item.phoneNumber || "",
          isDefault:item.isDefault || "",
          locationName:item.locationName || "",
          location:location,
          orderItems: item.orderItems || "",
          description: item.description || "",
          isOrderAssign: item.isOrderAssign || "",
          startHotTempValue: item.startHotTempValue || "",
          startHotTempDateAndTime: item.startHotTempDateAndTime || "",
          endHotTempValue: item.endHotTempValue || "",
          endHotTempDateAndTime: item.endHotTempDateAndTime || "",
          startColdTempValue: item.startColdTempValue || "",
          startColdTempDateAndTime: item.startColdTempDateAndTime || "",
          endColdTempValue: item.endColdTempValue || "",
          endColdTempDateAndTime: item.endColdTempDateAndTime || "",
          created_at: item.created_at || "",
        });
      });
      if (orderArray.length === 0)
        return res.status(400).json({ status: 0, message: "Order not found" });

      const pageOne = pagination.paginate(orderArray, page, limit);

      return res.status(200).json({
        status: 1,
        message: "Delivered order list.",
        data: pageOne,
      });
    }
  } catch (error) {
    console.log("error.........", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

exports.filterOrder = async (req, res, next) => {
  try {
    const { tab, page, limit, orderDate, userId } = req.body;
    const user = await driverModel.findById(req.user._id);
    if (!user) return res.status(400).json({ status: 0, message: "User not found" });

    // Build the query condition
    let queryCondition = { driverId: user._id };
    if (orderDate) queryCondition.orderDate = new Date(orderDate);
    if (userId) queryCondition.userId = userId;

    if (tab === "new") {
      queryCondition.orderStatus = "Upcoming";

      const order = await orderData
        .find(queryCondition)
        .populate({ path: "userId", select: "firstName lastName userImage" })
        .sort({ orderDate: -1 });

      const orderArray = order.map((item) => {
        const location = (item.location && item.location.coordinates && item.location.coordinates.length === 2)
        ? {
          type: 'Point',
          coordinates: [
            item.location.coordinates[0] || 0, // Fallback to 0 if longitude is missing
            item.location.coordinates[1] || 0, // Fallback to 0 if latitude is missing
          ],
        }
        : { type: 'Point', coordinates: [0, 0] }; // Fallback location
        return {
          _id: item._id,
          orderCode: item.orderCode || "",
          firstName: item.userId.firstName || "",
          lastName: item.userId.lastName || "",
          userImage: item.userId.userImage || "",
          orderDate: item.orderDate || "",
          orderStatus: item.orderStatus || "",
          address: item.addressId || "",
          streetAddress:item.streetAddress || "",
          city:item.city || "",
          state:item.state || "",
          zipCode:item.zipCode || "",
          phoneNumber:item.phoneNumber || "",
          isDefault:item.isDefault || "",
          locationName:item.locationName || "",
          location:location,
          orderItems: item.orderItems || "",
          description: item.description || "",
          startHotTempValue: item.startHotTempValue || "",
          startHotTempDateAndTime: item.startHotTempDateAndTime || "",
          endHotTempValue: item.endHotTempValue || "",
          endHotTempDateAndTime: item.endHotTempDateAndTime || "",
          startColdTempValue: item.startColdTempValue || "",
          startColdTempDateAndTime: item.startColdTempDateAndTime || "",
          endColdTempValue: item.endColdTempValue || "",
          endColdTempDateAndTime: item.endColdTempDateAndTime || "",
          isOrderAssign: item.isOrderAssign || "",
          created_at: item.created_at || "",
        };
      });
      if (orderArray.length === 0)
        return res.status(200).json({ status: 1, message: "Order not found" });

      const pageOne = pagination.paginate(orderArray, page, limit);

      return res.status(200).json({
        status: 1,
        message: "Upcoming order list.",
        data: pageOne,
      });
    } else {
      queryCondition.orderStatus = "Delivered";

      const order = await orderData
        .find(queryCondition)
        .populate({ path: "userId", select: "firstName lastName userImage" })
        .sort({ orderDate: -1 });

      const orderArray = order.map((item) => {
        const location = (item.location && item.location.coordinates && item.location.coordinates.length === 2)
        ? {
          type: 'Point',
          coordinates: [
            item.location.coordinates[0] || 0, // Fallback to 0 if longitude is missing
            item.location.coordinates[1] || 0, // Fallback to 0 if latitude is missing
          ],
        }
        : { type: 'Point', coordinates: [0, 0] }; // Fallback location
        return {
          _id: item._id,
          orderCode: item.orderCode || "",
          firstName: item.userId.firstName || "",
          lastName: item.userId.lastName || "",
          userImage: item.userId.userImage || "",
          orderDate: item.orderDate || "",
          orderStatus: item.orderStatus || "",
          address: item.addressId || "",
          streetAddress:item.streetAddress || "",
          city:item.city || "",
          state:item.state || "",
          zipCode:item.zipCode || "",
          phoneNumber:item.phoneNumber || "",
          isDefault:item.isDefault || "",
          locationName:item.locationName || "",
          location:location,
          orderItems: item.orderItems || "",
          description: item.description || "",
          startHotTempValue: item.startHotTempValue || "",
          startHotTempDateAndTime: item.startHotTempDateAndTime || "",
          endHotTempValue: item.endHotTempValue || "",
          endHotTempDateAndTime: item.endHotTempDateAndTime || "",
          startColdTempValue: item.startColdTempValue || "",
          startColdTempDateAndTime: item.startColdTempDateAndTime || "",
          endColdTempValue: item.endColdTempValue || "",
          endColdTempDateAndTime: item.endColdTempDateAndTime || "",
          isOrderAssign: item.isOrderAssign || "",
          created_at: item.created_at || "",
        };
      });
      if (orderArray.length === 0)
        return res.status(400).json({ status: 0, message: "Order not found" });

      const pageOne = pagination.paginate(orderArray, page, limit);

      return res.status(200).json({
        status: 1,
        message: "Delivered order list.",
        data: pageOne,
      });
    }
  } catch (error) {
    console.log("error.........", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};
exports.clientList = async (req, res) => {
  try {
    const driverId = req.user._id;

    // Find orders assigned to the driver
    const orders = await orderData.find({ driverId: driverId }).populate({
      path: "userId",
      select: "firstName lastName userImage",
    });

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        status: 1,
        message: "No clients found for the assigned orders.",
        data: [],
      });
    }

    // Extract unique client information
    const clients = orders.reduce((acc, order) => {
      const client = order.userId;
      if (!acc.some((item) => item._id.equals(client._id))) {
        acc.push({
          _id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          userImage: client.userImage,
        });
      }
      return acc;
    }, []);

    return res.status(200).json({
      status: 1,
      message: "Client list retrieved successfully.",
      data: clients,
    });
  } catch (error) {
    console.log("Error fetching client list:", error);
    return res.status(500).json({
      status: 0,
      message: "Something went wrong, please try again later.",
      error: error.message,
    });
  }
};
//notification setting
exports.notificationSetting = async (req, res, next) => {
  try {
    const { notificationStart } = req.body;
    const driver = await driverModel.findById(req.user._id);
    driver.notificationStart = notificationStart;

    let save = await driver.save();
    res.status(200).json({
      status: 1,
      message: "Notification Settings updated successfully.",
      data: save,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//get notification
exports.listNotification = async (req, res, next) => {
  try {
    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    const notificationAll = await notificationModel
      .find({
        receiverId: driver._id,
      })
      .sort({ notificationSendAt: -1 });

    if (notificationAll.length === 0)
      return res
        .status(400)
        .json({ status: 0, message: "Notfication Not Found" });

    res
      .status(200)
      .json({ status: 1, message: "get notification", data: notificationAll });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something went wrong please try again later.",
    });
  }
};

//get notification count
exports.countNotification = async (req, res, next) => {
  try {
    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    const notificationCount = await notificationModel.countDocuments({
      receiverId: driver._id,
      isRead: false,
    });
    res.status(200).json({
      status: 1,
      message: "Count of Notification",
      data: { notificationCount: notificationCount },
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something Went Wrong, Please Try Again Later",
    });
  }
};

//read notifications
exports.readNotification = async (req, res, next) => {
  try {
    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    const notificationCount = await notificationModel.updateMany(
      { receiverId: driver._id },
      {
        $set: {
          isRead: true,
        },
      }
    );
    res.status(200).json({
      status: 1,
      message: "Read all notifications suucessfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something Went Wrong, Please Try Again Later",
    });
  }
};

//order details
exports.orderDetails = async (req, res, next) => {
  try {
    let { orderId } = req.body;

    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    const orderDetails = await orderData
      .findById(orderId)
      .populate({ path: "userId", select: "firstName lastName userImage" })

    if (!orderDetails) {
      return res.status(400).json({ status: 0, message: "Not found orders" });
    }
    const location = (orderDetails.location && orderDetails.location.coordinates && orderDetails.location.coordinates.length === 2)
        ? {
          type: 'Point',
          coordinates: [
            orderDetails.location.coordinates[0] || 0, // Fallback to 0 if longitude is missing
            orderDetails.location.coordinates[1] || 0, // Fallback to 0 if latitude is missing
          ],
        }
        : { type: 'Point', coordinates: [0, 0] }; // Fallback location
    const resData = {
      _id: orderDetails._id,
      orderCode: orderDetails.orderCode || "",
      firstName: orderDetails.userId.firstName || "",
      lastName: orderDetails.userId.lastName || "",
      userImage: orderDetails.userId.userImage || "",
      orderDate: orderDetails.orderDate || "",
      orderStatus: orderDetails.orderStatus || "",
      address: orderDetails.addressId || "",
      streetAddress:orderDetails.streetAddress || "",
      city:orderDetails.city || "",
      state:orderDetails.state || "",
      zipCode:orderDetails.zipCode || "",
      phoneNumber:orderDetails.phoneNumber || "",
      isDefault:orderDetails.isDefault || "",
      locationName:orderDetails.locationName || "",
      location:location,
      orderItems: orderDetails.orderItems || "",
      description: orderDetails.description || "",
      orderorderDetailss: orderDetails.orderorderDetailss || "",
      startHotTempValue: orderDetails.startHotTempValue || "",
      startHotTempDateAndTime: orderDetails.startHotTempDateAndTime || "",
      endHotTempValue: orderDetails.endHotTempValue || "",
      endHotTempDateAndTime: orderDetails.endHotTempDateAndTime || "",
      startColdTempValue: orderDetails.startColdTempValue || "",
      startColdTempDateAndTime: orderDetails.startColdTempDateAndTime || "",
      endColdTempValue: orderDetails.endColdTempValue || "",
      endColdTempDateAndTime: orderDetails.endColdTempDateAndTime || "",
      isOrderAssign: orderDetails.isOrderAssign || "",
      driverId: orderDetails.driverId || "",
      created_at: orderDetails.created_at || "",
    };
    res.status(200).json({
      status: 1,
      message: "Orders data retrive successfully.",
      data: resData,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Something Went Wrong, Please Try Again Later",
    });
  }
};

//driver add start temprature
// exports.saveStartTemprature = async (req, res, next) => {
//   try {
//     const { ordersId, typeOfTemp, startTempValue, startTempDateAndTime } =
//       req.body;

//     const driver = await driverModel.findById(req.user._id);
//     if (!driver)
//       return res.status(400).json({ status: 0, message: "driver not found" });

//     const order = await orderData.findById(ordersId);

//     if (typeOfTemp === "hot") {
//       order.startHotTempValue = startTempValue;
//       order.startHotTempDateAndTime = startTempDateAndTime;

//       let save = await order.save();

//       if (save) {
//         return res
//           .status(200)
//           .json({ status: 1, message: "Start temprature saved successfully." });
//       } else {
//         res.status(400).json({
//           status: 0,
//           message: "Something Went Wrong, Please Try Again Later",
//         });
//       }
//     } else {
//       order.startColdTempValue = startTempValue;
//       order.startColdTempDateAndTime = startTempDateAndTime;

//       let save = await order.save();

//       if (save) {
//         return res
//           .status(200)
//           .json({ status: 1, message: "Start temprature saved successfully." });
//       } else {
//         res.status(400).json({
//           status: 0,
//           message: "Something Went Wrong, Please Try Again Later",
//         });
//       }
//     }
//   } catch (error) {
//     console.log("error......", error);
//     res.status(500).json({
//       status: 0,
//       message: "Something Went Wrong, Please Try Again Later",
//     });
//   }
// };
exports.saveStartTemprature = async (req, res, next) => {
  try {
    const { ordersId, startTempValue, startTempDateAndTime, orderItemId, nestedItemId } = req.body;

    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    const order = await orderData.findById(ordersId);
    if (!order)
      return res.status(400).json({ status: 0, message: "order not found" });

    const orderItem = order.orderItems.id(orderItemId);
    if (!orderItem)
      return res.status(400).json({ status: 0, message: "order item not found" });

    const nestedItem = orderItem.orderItem.id(nestedItemId);
    if (!nestedItem)
      return res.status(400).json({ status: 0, message: "nested order item not found" });

    nestedItem.startTempValue = startTempValue;
    nestedItem.startTempDateAndTime = startTempDateAndTime;

    const save = await order.save();

    if (save) {
      return res.status(200).json({ status: 1, message: "Start temperature saved successfully." });
    } else {
      res.status(400).json({ status: 0, message: "Something went wrong, please try again later" });
    }
  } catch (error) {
    console.log("error......", error);
    res.status(500).json({ status: 0, message: "Something went wrong, please try again later" });
  }
};
//driver add end temprature
// exports.endStartTemprature = async (req, res, next) => {
//   try {
//     const { ordersId, typeOfTemp, endTempValue, endTempDateAndTime } = req.body;

//     const driver = await driverModel.findById(req.user._id);
//     if (!driver)
//       return res.status(400).json({ status: 0, message: "driver not found" });

//     const order = await orderData.findById(ordersId);

//     if (typeOfTemp === "hot") {
//       order.endHotTempValue = endTempValue;
//       order.endHotTempDateAndTime = endTempDateAndTime;

//       let save = await order.save();

//       if (save) {
//         return res
//           .status(200)
//           .json({ status: 1, message: "end temprature saved successfully." });
//       } else {
//         res.status(400).json({
//           status: 0,
//           message: "Something Went Wrong, Please Try Again Later",
//         });
//       }
//     } else {
//       order.endColdTempValue = endTempValue;
//       order.endColdTempDateAndTime = endTempDateAndTime;

//       let save = await order.save();

//       if (save) {
//         return res
//           .status(200)
//           .json({ status: 1, message: "end temprature saved successfully." });
//       } else {
//         res.status(400).json({
//           status: 0,
//           message: "Something Went Wrong, Please Try Again Later",
//         });
//       }
//     }
//   } catch (error) {
//     console.log("error......", error);
//     res.status(500).json({
//       status: 0,
//       message: "Something Went Wrong, Please Try Again Later",
//     });
//   }
// };
exports.endStartTemprature = async (req, res, next) => {
  try {
    const { ordersId, typeOfTemp, endTempValue, endTempDateAndTime, orderItemId, nestedItemId } = req.body;

    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    const order = await orderData.findById(ordersId);
    if (!order)
      return res.status(400).json({ status: 0, message: "order not found" });

    const orderItem = order.orderItems.id(orderItemId);
    if (!orderItem)
      return res.status(400).json({ status: 0, message: "order item not found" });

    const nestedItem = orderItem.orderItem.id(nestedItemId);
    if (!nestedItem)
      return res.status(400).json({ status: 0, message: "nested order item not found" });

      nestedItem.endTempValue = endTempValue;
      nestedItem.endTempDateAndTime = endTempDateAndTime;

    const save = await order.save();

    if (save) {
      return res.status(200).json({ status: 1, message: "End temperature saved successfully." });
    } else {
      res.status(400).json({ status: 0, message: "Something went wrong, please try again later" });
    }
  } catch (error) {
    console.log("error......", error);
    res.status(500).json({ status: 0, message: "Something went wrong, please try again later" });
  }
};
//delivery completed by driver
exports.deliveryComplete = async (req, res, next) => {
  try {
    let { orderId, receiveCustomerFirstName, receiveCustomerLastName, were_all_regular_menu_items_delivered,were_all_modified_and_vegetarian_items_delivered,clientComments,missingItems } =
      req.body;

    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    const order = await orderData.findById(orderId).populate({
      path: "userId",
      select: "firstName lastName userImage email",
    });
    if (!order)
      return res.status(400).json({ status: 0, message: "Order not found" });

    order.were_all_regular_menu_items_delivered = were_all_regular_menu_items_delivered
    order.were_all_modified_and_vegetarian_items_delivered = were_all_modified_and_vegetarian_items_delivered
    order.clientComments=clientComments
    order.receiveCustomerFirstName = receiveCustomerFirstName;
    order.receiveCustomerLastName = receiveCustomerLastName;
    order.customerSignature = req.file.location;
    order.orderStatus = "Delivered";
    order.isCustomerConfirmation = true;
    order.missingItems=missingItems

    // Assuming orderPDF is a file path or content of the generated PDF
    let save = await order.save();
    if (!save)
      return res.status(400).json({
        status: 0,
        message: "Something went wrong, please try again later",
      });

    const admin = await adminData.findOne({ role: "Admin" });
    const orderPDF = await createPdf(save._id);
    console.log("orderPDF......", orderPDF);
    order.orderPDF = orderPDF;
    let pdfSave = await order.save();
    const attachments = {
      filename: "Invoice.pdf",
      path: pdfSave.orderPDF,
    };

    //send email
    let subject = `${pdfSave.orderCode} Order Invoice .`;
    const emailResult1 = await sendEmail(
      save.userId.email,
      subject,
      invoicePDF({
        userName: `${save.userId.firstName} ${save.userId.lastName}`,
        pdfLink: pdfSave.orderPDF,
      }),
      attachments
    );
    const emailResult2 = await sendEmail(
      admin.email,
      subject,
      invoicePDF({
        userName: `${save.userId.firstName} ${save.userId.lastName}`,
        pdfLink: pdfSave.orderPDF,
      }),
      attachments
    );

    // if (!(emailResult1 && emailResult2)) {
    //   // Handle email sending error, e.g., rollback order save
    //   return res.status(500).json({
    //     status: 0,
    //     message: 'Failed to send email. Order data not saved.'
    //   });
    // }

    return res
      .status(200)
      .json({ status: 1, message: "Order delivered successfully." });
  } catch (error) {
    console.log("error......", error);
    res.status(500).json({
      status: 0,
      message: "Something went wrong, please try again later",
    });
  }
};

//total delivery complete list and count
exports.listCompleteDelivery = async (req, res, next) => {
  try {
    let { page, limit, searchQuery } = req.body;

    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    let query = {
      driverId: driver._id,
      orderStatus: "Delivered",
    };

    // Implement search query conditions
    if (searchQuery) {
      query.$or = [
        { "userId.firstName": { $regex: new RegExp(searchQuery, "i") } },
        { "userId.lastName": { $regex: new RegExp(searchQuery, "i") } },
        { orderCode: { $regex: new RegExp(searchQuery, "i") } },
        { "addressId.locationName": { $regex: new RegExp(searchQuery, "i") } },
      ];
    }
    const orderComplete = await orderData
      .find(query)
      .populate({ path: "userId", select: "firstName lastName userImage" })
      .sort({ orderDate: -1 });

    const completeOrderCount = await orderData.countDocuments({
      driverId: driver._id,
      orderStatus: "Delivered",
    });

    const orderArray = orderComplete.map((item) => {
      const location = (item.location && item.location.coordinates && item.location.coordinates.length === 2)
        ? {
          type: 'Point',
          coordinates: [
            item.location.coordinates[0] || 0, // Fallback to 0 if longitude is missing
            item.location.coordinates[1] || 0, // Fallback to 0 if latitude is missing
          ],
        }
        : { type: 'Point', coordinates: [0, 0] }; // Fallback location
      return (obj = {
        _id: item._id,
        orderCode: item.orderCode || "",
        firstName: item.userId.firstName || "",
        lastName: item.userId.lastName || "",
        userImage: item.userId.userImage || "",
        orderDate: item.orderDate || "",
        orderStatus: item.orderStatus || "",
        address: item.addressId || "",
        streetAddress:item.streetAddress || "",
        city:item.city || "",
        state:item.state || "",
        zipCode:item.zipCode || "",
        phoneNumber:item.phoneNumber || "",
        isDefault:item.isDefault || "",
        locationName:item.locationName || "",
        location:location,
        description: item.description || "",
        startHotTempValue: item.startHotTempValue || "",
        startHotTempDateAndTime: item.startHotTempDateAndTime || "",
        endHotTempValue: item.endHotTempValue || "",
        endHotTempDateAndTime: item.endHotTempDateAndTime || "",
        startColdTempValue: item.startColdTempValue || "",
        startColdTempDateAndTime: item.startColdTempDateAndTime || "",
        endColdTempValue: item.endColdTempValue || "",
        endColdTempDateAndTime: item.endColdTempDateAndTime || "",
        orderItems: item.orderItems || "",
        isOrderAssign: item.isOrderAssign || "",
        created_at: item.created_at || "",
      });
    });
    if (orderArray.length === 0)
      return res.status(200).json({ status: 1, message: "Order not found" });

    const pageOne = pagination.paginate(orderArray, page, limit);

    res.status(200).json({
      status: 1,
      message: "Delivered order list.",
      data: pageOne,
      countTotalDeliverd: completeOrderCount,
    });
  } catch (error) {
    console.log("error......", error);
    res.status(500).json({
      status: 0,
      message: "Something Went Wrong, Please Try Again Later",
    });
  }
};

//delete account driver account by driver
exports.deleteAccount = async (req, res, next) => {
  try {
    const driver = await driverModel.findById(req.user._id);
    if (!driver)
      return res.status(400).json({ status: 0, message: "driver not found" });

    //driver delete account
    driver.isDeleted = true;

    let save = await driver.save();

    res.status(200).json({
      status: 1,
      message: "Your account deleted successfully.",
    });
  } catch (error) {
    console.log("error......", error);
    res.status(500).json({
      status: 0,
      message: "Something Went Wrong, Please Try Again Later",
    });
  }
};
