// routes/admin.js
const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const authenticate = require("../middleware/auth");

// Admin functionalities
router.post("/invite", authenticate, adminController.inviteUser);
router.post("/make-admin", authenticate, adminController.makeAdmin);
router.post("/remove-user", authenticate, adminController.removeUser);
router.get("/group-members/:groupId", authenticate, adminController.getGroupMembers);

module.exports = router;

