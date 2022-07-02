const nodemailer = require('nodemailer');
const oderStatusEmailHandler = async (emails, subject, emailBody) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_ADD,
        port: process.env.EMAIL_SMTP_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: '"BC Digital" <no-reply@bcdigital.online>', // sender address
        to: emails, // list of receivers
        subject, // Subject line
        html: emailBody, // html body
    });

    return info.messageId;
}

module.exports = {
    oderStatusEmailHandler
}