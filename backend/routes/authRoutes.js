const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/authController");
const requireAuth = require("../middleware/auth");
const { validate, register, login } = require("../middleware/validators");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

router.post("/register", validate(register), ctrl.register);
router.post("/login", loginLimiter, validate(login), ctrl.login);
router.get("/me", requireAuth, ctrl.me);

module.exports = router;