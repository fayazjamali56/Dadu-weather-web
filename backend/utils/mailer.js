const nodemailer = require("nodemailer");

let transporter;

exports.sendMail = async ({ to, subject, text }) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return false;
  transporter = transporter || nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
  await transporter.sendMail({ from: `"Dadu Weather" <${process.env.MAIL_USER}>`, to, subject, text });
  return true;
};