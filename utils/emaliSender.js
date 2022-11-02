const nodemailer = require("nodemailer");

const emailSender = async function (options) {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  const info = await transport.sendMail({
    from: '"Sonde Omobolaji 🎯" <omobolajisonde@gmail.com>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.body, // plain text body
    html: `<div>${options.body}</div>`, // html body
  });

  console.log("Message sent %s", info.messageId);
};

module.exports = emailSender;
