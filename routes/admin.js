// routes/admin.js
const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const authenticateController = require("../middleware/auth");

router.put("/make-admin", authenticateController.authenticate, adminController.makeAdmin);
router.delete("/remove-member", authenticateController.authenticate, adminController.removeMember);

module.exports = router;

