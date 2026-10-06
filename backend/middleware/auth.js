const { verifyToken } = require("../utils/token");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in first." });
  try {
    req.userId = verifyToken(token).id;
    next();
  } catch {
    res.status(401).json({ message: "Your session expired. Please log in again." });
  }
};