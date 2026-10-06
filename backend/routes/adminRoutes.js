const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");

router.use(requireAuth, requireAdmin);

router.get("/stats", ctrl.stats);
router.get("/users", ctrl.users);
router.get("/logins", ctrl.logins);
router.get("/messages", ctrl.messages);
router.post("/messages/:id/reply", ctrl.reply);

module.exports = router;