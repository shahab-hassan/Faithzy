const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_APP_PASS,
        },
    });

    const mailOptions = {
        from: options.from || process.env.SMTP_FROM_EMAIL,
        to: options.to || process.env.SMTP_FROM_EMAIL,
        subject: options.subject,
        html: options.text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;