const nodemailer = require("nodemailer");

const emailSender = async function (options) {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  let mailOptions = {
    from: `"Sonde Omobolaji 🎯" <${process.env.EMAIL_USER}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.body, // plain text body
    html: `<div>${options.body}</div>`, // html body
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent %s", info.messageId);
};

module.exports = emailSender;
