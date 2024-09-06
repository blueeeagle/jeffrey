const nodemailer = require("nodemailer");
// for forget password

const sendEmail = async(email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text
        });
        console.log('log is >>>>',transporter);

        console.log("email sent sucessfully")
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;