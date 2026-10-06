const { normalizePhone } = require("../utils/phone");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const blank = (v) => !String(v || "").trim();

exports.register = (b) => {
  const e = {};
  if (blank(b.firstName)) e.firstName = "Enter your first name.";
  if (blank(b.lastName)) e.lastName = "Enter your last name.";
  if (!EMAIL.test(String(b.email || "").trim())) e.email = "Enter a valid email address.";
  if (!normalizePhone(b.phone)) e.phone = "Enter a valid mobile number, like 0300 1234567.";
  const pw = String(b.password || "");
  if (pw.length < 8) e.password = "Use at least 8 characters.";
  else if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) e.password = "Use both letters and numbers.";
  if (pw !== b.confirmPassword) e.confirmPassword = "Passwords do not match.";
  if (blank(b.city)) e.city = "Select your location.";
  return e;
};

exports.login = (b) => {
  const e = {};
  if (blank(b.identifier)) e.identifier = "Enter your email or phone.";
  if (!b.password) e.password = "Enter your password.";
  return e;
};

exports.contact = (b) => {
  const e = {};
  if (blank(b.name)) e.name = "Enter your name.";
  if (!EMAIL.test(String(b.email || "").trim())) e.email = "Enter a valid email address.";
  if (blank(b.subject)) e.subject = "Enter a subject.";
  if (blank(b.message)) e.message = "Write a message.";
  return e;
};

exports.validate = (rule) => (req, res, next) => {
  const errors = rule(req.body || {});
  if (Object.keys(errors).length) return res.status(422).json({ message: "Please fix the highlighted fields.", errors });
  next();
};