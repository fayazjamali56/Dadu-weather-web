const contactModel = require("../models/contactModel");
const asyncHandler = require("../utils/asyncHandler");

exports.send = asyncHandler(async (req, res) => {
  const b = req.body;
  await contactModel.create({
    name: b.name.trim(), email: b.email.trim().toLowerCase(),
    phone: (b.phone || "").trim(), subject: b.subject.trim(), message: b.message.trim(),
  });
  res.status(201).json({ message: "Message sent. Thank you!" });
});