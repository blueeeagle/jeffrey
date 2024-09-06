const nodemailer = require('nodemailer')
require('dotenv').config()

const sendEmail2 = async (email, subject, html, attachments) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secureConnection: false,
      auth: {
        user: "apporders@jefferyscatering.com",
        pass: "L0r3nDr@gon2024!!"
      },
      tls: {
        ciphers: 'SSLv3'
      }
    })

    await transporter.sendMail({
      from: "apporders@jefferyscatering.com",
      to: email,
      subject: subject,
      html: html,
      attachments: attachments
    })

    console.log('email sent sucessfully')
  } catch (error) {
    console.log(error, 'email not sent')
  }
}

module.exports = sendEmail2
