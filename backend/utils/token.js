const jwt = require("jsonwebtoken");

exports.signToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });

exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);