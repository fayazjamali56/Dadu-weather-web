const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const cityModel = require("../models/cityModel");
const loginLog = require("../models/loginLogModel");
const { normalizePhone } = require("../utils/phone");
const { signToken } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");

const publicUser = (u) => ({
  id: u.id, firstName: u.first_name, lastName: u.last_name,
  email: u.email, phone: u.phone, city: u.city_name, role: u.role,
});
// Register: saves the new user in `users`
exports.register = asyncHandler(async (req, res) => {
  const b = req.body;
  const email = b.email.trim().toLowerCase();
  const phone = normalizePhone(b.phone);

  const city = await cityModel.findBySlug(b.city);
  if (!city) return res.status(422).json({ message: "Invalid location.", errors: { city: "Choose a location from the list." } });

  const errors = {};
  if (await userModel.findByEmail(email)) errors.email = "This email is already registered.";
  if (await userModel.findByPhone(phone)) errors.phone = "This phone number is already registered.";
  if (Object.keys(errors).length) return res.status(409).json({ message: "Account already exists.", errors });

  const passwordHash = await bcrypt.hash(b.password, 10);
  const id = await userModel.createUser({
    firstName: b.firstName.trim(), lastName: b.lastName.trim(),
    email, phone, passwordHash, cityId: city.id,
  });
  res.status(201).json({ message: "Account created. You can log in now.", userId: id });
});

// Login: checks password and saves a row in `login_logs`
exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const id = identifier.trim();
  const email = id.includes("@") ? id.toLowerCase() : "";
  const phone = id.includes("@") ? "" : normalizePhone(id) || "";

  const user = await userModel.findByEmailOrPhone(email, phone);
  const ok = user ? await bcrypt.compare(password, user.password_hash) : false;

  await loginLog.record({ userId: user && user.id, identifier: id, success: ok, ip: req.ip, userAgent: req.headers["user-agent"] });

  if (!ok) return res.status(401).json({ message: "Email/phone or password is incorrect." });
  res.json({ message: "Logged in.", token: signToken(user), user: publicUser(user) });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: publicUser(user) });
});