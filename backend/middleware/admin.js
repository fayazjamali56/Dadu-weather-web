const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user || user.role !== "admin") return res.status(403).json({ message: "Admins only." });
    next();
  } catch (err) { next(err); }
};