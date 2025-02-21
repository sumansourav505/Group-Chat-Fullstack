// routes/admin.js
const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();
const authenticateController = require("../middleware/auth");

// Admin functionalities
//router.post("/invite", authenticateController.authenticate, adminController.inviteUser);
router.put("/make-admin", authenticateController.authenticate, adminController.makeAdmin);
router.delete("/remove-member", authenticateController.authenticate, adminController.removeMember);
//router.get("/group-members/:groupId", authenticateController.authenticate, adminController.getGroupMembers);

module.exports = router;

