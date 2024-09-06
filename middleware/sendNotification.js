const FCM = require("fcm-node");
const Notification = require("../models/notification");
const driverModel = require("../models/driver");
// const { fcm_server_key } = require('../config/key')
const moment = require("moment");
const adminData = require("../models/adminmodel");
const userData = require("../models/usermodel");

const fcm = new FCM(process.env.FCM_KEY);

const sendNotification = async (data) => {
  try {
    let message;
    let user;

    if (data.notificationSendTo === "admin") {
      let admins = await adminData.findOne({ role: "Admin" }).exec();

      if (
        data.type === "new_driver_registration" ||
        data.type === "new_client_registration"
      ) {
        let saveNotification = new Notification({
          receiverId: admins._id,
          senderId: data.senderId,
          senderId_image: data.senderId_image,
          senderId_name: data.senderId_name,
          notificationSendAt: moment().format("YYYY-MM-DD hh:mm:ss"),
          notificationTitle: data.title,
          notificationBody: data.body,
          notificationType: data.type,
        });

        await saveNotification.save();

        let adminDeviceToken = admins.deviceToken;
        if (adminDeviceToken) {
          message = {
            to: adminDeviceToken,
            notification: {
              title: data.title,
              priority: "high",
              body: data.body,
              sound: "default",
              image: "http://52.7.244.188:3000/assets/images/mainlogo.png",
            },
          };
          fcm.send(message, async (err, response) => {
            if (err) {
              console.log(
                "------------------------------device Token Fail  " +
                  adminDeviceToken
              );
              console.log(err);
            } else {
              console.log(
                "------------------------------device Token Send  " +
                  adminDeviceToken
              );
              console.log(response);
            }
          });
        } else {
          console.log(
            "User does not have a device token. Skipping notification."
          );
        }
      } else {
        let saveNotification = new Notification({
          receiverId: admins._id,
          senderId: data.senderId,
          senderId_image: data.senderId_image,
          senderId_name: data.senderId_name,
          orderId: data.orderId,
          notificationSendAt: moment().format("YYYY-MM-DD hh:mm:ss"),
          notificationTitle: data.title,
          notificationBody: data.body,
          notificationType: data.type,
        });

        await saveNotification.save();

        let adminDeviceToken = admins.deviceToken;
        if (adminDeviceToken) {
          message = {
            to: adminDeviceToken,
            notification: {
              title: data.title,
              priority: "high",
              body: data.body,
              sound: "default",
              image: "http://52.7.244.188:3000/assets/images/mainlogo.png",
            },
          };
          fcm.send(message, async (err, response) => {
            if (err) {
              console.log(
                "------------------------------device Token Fail  " +
                  adminDeviceToken
              );
              console.log(err);
            } else {
              console.log(
                "------------------------------device Token Send  " +
                  adminDeviceToken
              );
              console.log(response);
            }
          });
        } else {
          console.log(
            "User does not have a device token. Skipping notification."
          );
        }
      }
      //   }
    } else if (data.notificationSendTo === "customer") {
      user = await userData.findOne({ _id: data.receiverId }).exec();

      var notification = new Notification({
        receiverId: data.receiverId,
        senderId: data.senderId,
        senderId_image: data.senderId_image,
        senderId_name: data.senderId_name,
        orderId: data.orderId ? data.orderId : "",
        orderCode: data.orderCode ? data.orderCode : "",
        notificationSendAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        notificationTitle: data.title,
        notificationBody: data.body,
        notificationType: data.type,
      });

      await notification.save();
      let userDeviceToken;

      if (user.deviceId) {
        console.log("user.....", user.deviceId);

        if (user.deviceId) userDeviceToken = user.deviceId;
        //selected tone for caller
        message = {
          to: userDeviceToken,
          notification: {
            title: data.title,
            priority: "high",
            body: data.body,
            sound: "default",
            image: "http://52.7.244.188:3000/assets/images/mainlogo.png",
          },
        };
      }
      fcm.send(message, async (err, response) => {
        if (err) {
          console.log(
            "------------------------------device Token Fail  " +
              userDeviceToken
          );
          console.log(err);
        } else {
          console.log(
            "------------------------------device Token Send  " +
              userDeviceToken
          );
          console.log(response);
        }
      });
    } else {
      console.log("data........", data);
      user = await driverModel.findOne({ _id: data.receiverId }).exec();
      console.log("user........", user);

      var notification = new Notification({
        receiverId: data.receiverId,
        senderId: data.senderId,
        senderId_image: data.senderId_image,
        senderId_name: data.senderId_name,
        orderId: data.orderId ? data.orderId : "",
        orderCode: data.orderCode ? data.orderCode : "",
        notificationSendAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        notificationTitle: data.title,
        notificationBody: data.body,
        notificationType: data.type,
      });

      await notification.save();
      let userDeviceToken;

      if (user.deviceToken) {
        console.log("user.....", user.deviceToken);

        if (user.deviceToken) userDeviceToken = user.deviceToken;
        //selected tone for caller
        message = {
          to: userDeviceToken,
          notification: {
            title: data.title,
            priority: "high",
            body: data.body,
            sound: "default",
            image: "http://52.7.244.188:3000/assets/images/mainlogo.png",
          },
        };
      } else {
        console.log(
          "User does not have a device token. Skipping notification."
        );
        return;
      }

      if (user.notificationStart === true) {
        fcm.send(message, async (err, response) => {
          if (err) {
            console.log(
              "------------------------------device Token Fail  " +
                userDeviceToken
            );
            console.log(err);
          } else {
            console.log(
              "------------------------------device Token Send  " +
                userDeviceToken
            );
            console.log(response);
          }
        });
      } else {
        console.log("Notification start flag is false. Skipping notification.");
        return;
      }
    }
  } catch (error) {
    console.log("Error occurred while sending notification", error);
    throw error;
  }
};

module.exports = sendNotification;
