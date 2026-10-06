const router = require("express").Router();
const ctrl = require("../controllers/contactController");
const { validate, contact } = require("../middleware/validators");

router.post("/", validate(contact), ctrl.send);

module.exports = router;