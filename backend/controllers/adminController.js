const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const sendEmail = require("../utils/mailer");

exports.stats = asyncHandler(async (req, res) => res.json(await adminModel.stats()));
exports.users = asyncHandler(async (req, res) => res.json(await userModel.listAll()));
exports.logins = asyncHandler(async (req, res) => res.json(await adminModel.logins()));
exports.messages = asyncHandler(async (req, res) => res.json(await adminModel.messages()));

exports.reply = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const text = String(req.body.reply || "").trim();
  if (!text) return res.status(422).json({ message: "Write a reply first." });

  const msg = await adminModel.findMessage(id);
  if (!msg) return res.status(404).json({ message: "Message not found." });

  let emailed = false;
  try {
    emailed = await sendEmail({
      to: msg.email,
      subject: "Re: " + msg.subject,
      text: `${text}\n\n---\nYour message:\n${msg.message}`,
    });
  } catch (err) {
    console.error("Mail failed:", err.message);
    return res.status(502).json({ message: "Email could not be sent: " + err.message });
  }

  await adminModel.saveReply(id, text);
  res.json({
    message: emailed ? "Reply sent by email and saved." : "Reply saved. Email is not set up yet, so it was not emailed.",
  });
});
